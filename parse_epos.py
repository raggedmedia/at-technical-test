import os
import struct
import json
import random
import math

# EPOS format: binary, no header, 44 bytes per record (11 x 32-bit floats)
# Field order: x, y, z, m/q, tof, Vdc, Vpulse, det_x, det_y, pulse_number (int), pulse_fraction
# Instruments: LEAP 4000/5000 series (Cameca/Ametek) — big-endian IEEE 754
# pulse_number is actually a uint32, but reading as float is fine for skipping purposes

RECORD_SIZE = 44
FIELDS = 11  # 11 x float32 big-endian

MZ_BIN_WIDTH = 0.1   # Da per bin
MZ_MAX = 200.0        # Da — covers all common elements
NUM_BINS = int(MZ_MAX / MZ_BIN_WIDTH)   # 2000 bins

POINT_CLOUD_TARGET = 50_000


def detect_endian(f):
    """
    Read first 20 records in both endiannesses and pick whichever produces
    m/z values that are mostly in range 1–200 Da (physically plausible).
    Returns '>' (big) or '<' (little).
    """
    f.seek(0)
    raw = f.read(RECORD_SIZE * 20)
    if len(raw) < RECORD_SIZE:
        return '>'

    def plausible_mz_count(endian):
        count = 0
        for i in range(min(20, len(raw) // RECORD_SIZE)):
            offset = i * RECORD_SIZE
            try:
                # m/z is the 4th float (index 3), at byte offset 12
                (mz,) = struct.unpack_from(endian + 'f', raw, offset + 12)
                if 1.0 <= mz <= 200.0 and not math.isnan(mz):
                    count += 1
            except Exception:
                pass
        return count

    big = plausible_mz_count('>')
    little = plausible_mz_count('<')
    chosen = '>' if big >= little else '<'
    print(f"  Endian detection: big={big}/20 plausible, little={little}/20 plausible → using {'big' if chosen == '>' else 'little'}-endian")
    return chosen


def parse_epos(filepath):
    file_size = os.path.getsize(filepath)
    atom_count = file_size // RECORD_SIZE
    print(f"File: {filepath}")
    print(f"Size: {file_size / 1024 / 1024:.1f} MB")
    print(f"Records: {atom_count:,} (@ {RECORD_SIZE} bytes each)")

    # --- Endian detection ---
    with open(filepath, 'rb') as f:
        endian = detect_endian(f)

    fmt = endian + 'f'  # single float
    fmt4 = endian + '4f'  # x, y, z, mz together

    # --- Full pass: bounding box + mass spectrum + point cloud sample ---
    x_min = y_min = z_min = mz_min = float('inf')
    x_max = y_max = z_max = mz_max = float('-inf')

    spectrum = [0] * NUM_BINS  # counts per 0.1 Da bin

    # Systematic sample: take every Nth record to get ~50k atoms
    stride = max(1, atom_count // POINT_CLOUD_TARGET)
    sample_atoms = []  # [{x, y, mz}, ...]

    print(f"Running full pass (stride={stride} for point cloud)…")

    with open(filepath, 'rb') as f:
        record_idx = 0
        while True:
            chunk = f.read(RECORD_SIZE)
            if len(chunk) < RECORD_SIZE:
                break

            try:
                x, y, z, mz = struct.unpack_from(fmt4, chunk, 0)
            except struct.error:
                record_idx += 1
                continue

            # Sanity check — skip corrupt records
            if (math.isnan(x) or math.isnan(y) or math.isnan(z) or math.isnan(mz)
                    or not (-500 < x < 500)
                    or not (-500 < y < 500)
                    or not (-10 < z < 5000)
                    or not (0 < mz < 300)):
                record_idx += 1
                continue

            # Bounding box
            if x < x_min: x_min = x
            if x > x_max: x_max = x
            if y < y_min: y_min = y
            if y > y_max: y_max = y
            if z < z_min: z_min = z
            if z > z_max: z_max = z
            if mz < mz_min: mz_min = mz
            if mz > mz_max: mz_max = mz

            # Mass spectrum bin
            bin_idx = int(mz / MZ_BIN_WIDTH)
            if 0 <= bin_idx < NUM_BINS:
                spectrum[bin_idx] += 1

            # Point cloud sample
            if record_idx % stride == 0:
                sample_atoms.append([round(x, 3), round(y, 3), round(mz, 3)])

            record_idx += 1

        valid_count = record_idx  # approximate; some skipped but negligible

    # Trim point cloud to exactly 50k if we overshot
    if len(sample_atoms) > POINT_CLOUD_TARGET:
        sample_atoms = random.sample(sample_atoms, POINT_CLOUD_TARGET)

    print(f"Valid records processed: {valid_count:,}")
    print(f"Point cloud sample: {len(sample_atoms):,} atoms")
    print(f"Bounding box: x=[{x_min:.2f}, {x_max:.2f}] y=[{y_min:.2f}, {y_max:.2f}] z=[{z_min:.2f}, {z_max:.2f}] nm")
    print(f"m/z range: {mz_min:.2f} – {mz_max:.2f} Da")

    # Convert spectrum to compact [{mz, count}] — only include bins with counts > 0
    spectrum_bins = [
        {"mz": round(i * MZ_BIN_WIDTH, 1), "count": spectrum[i]}
        for i in range(NUM_BINS)
        if spectrum[i] > 0
    ]

    # --- Write output ---
    out_dir = os.path.join(os.path.dirname(filepath), 'public', 'data')
    os.makedirs(out_dir, exist_ok=True)

    summary = {
        "filename": os.path.basename(filepath),
        "atomCount": valid_count,
        "dimensions": {
            "x": {"min": round(x_min, 4), "max": round(x_max, 4), "range_nm": round(x_max - x_min, 4)},
            "y": {"min": round(y_min, 4), "max": round(y_max, 4), "range_nm": round(y_max - y_min, 4)},
            "z": {"min": round(z_min, 4), "max": round(z_max, 4), "range_nm": round(z_max - z_min, 4)},
        },
        "mzRange": {"min": round(mz_min, 2), "max": round(mz_max, 2)},
        "status": "Processed",
        "spectrum": spectrum_bins,
    }

    summary_path = os.path.join(out_dir, 'summary.json')
    with open(summary_path, 'w') as f:
        json.dump(summary, f, separators=(',', ':'))
    print(f"\n✓ {summary_path}  ({os.path.getsize(summary_path) / 1024:.0f} KB)")

    atoms_path = os.path.join(out_dir, 'atoms.json')
    with open(atoms_path, 'w') as f:
        json.dump(sample_atoms, f, separators=(',', ':'))
    print(f"✓ {atoms_path}  ({os.path.getsize(atoms_path) / 1024:.0f} KB)")
    print(f"\nDone. {len(spectrum_bins)} non-zero spectrum bins, {len(sample_atoms)} point cloud atoms.")


if __name__ == "__main__":
    epos_files = [f for f in os.listdir('.') if f.endswith('.epos')]
    if not epos_files:
        print("No .epos file found in current directory.")
        raise SystemExit(1)
    parse_epos(epos_files[0])


if __name__ == "__main__":
    # find the epos file in current dir
    epos_files = [f for f in os.listdir('.') if f.endswith('.epos')]
    if epos_files:
        parse_epos(epos_files[0])
    else:
        print("No .epos file found in current directory.")
