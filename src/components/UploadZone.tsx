import { useState, useRef } from 'react'
import { demoEdge } from '../lib/demoEdge'

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isDragInvalid, setIsDragInvalid] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [rejectKey, setRejectKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // .epos has no registered MIME type — its type is always ''
  // Any file with a known MIME type is definitively not .epos
  function isValidDrag(e: React.DragEvent): boolean {
    return Array.from(e.dataTransfer.items).every(
      item => item.kind !== 'file' || item.type === ''
    )
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    const valid = isValidDrag(e)
    setIsDragging(valid)
    setIsDragInvalid(!valid)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
      setIsDragInvalid(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    setIsHovered(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.epos')) {
      setIsDragInvalid(true)
      setRejectKey(k => k + 1)
      setTimeout(() => setIsDragInvalid(false), 1800)
      return
    }
    setIsDragInvalid(false)
    demoEdge('In the real app this file would begin processing.')
  }

  function handleFileChange() {
    if (inputRef.current?.files?.length) {
      demoEdge('In the real app this file would begin processing.')
      inputRef.current.value = ''
    }
  }

  const tone = isDragInvalid
    ? 'shake-zone border-solid border-red-600 bg-red-50'
    : isDragging
      ? 'scale-[1.015] border-solid border-slate-900 bg-white'
      : 'border-slate-300 bg-white/70 hover:border-slate-900 hover:bg-white focus-visible:border-slate-900'

  const iconMotion = isDragInvalid ? 'shake-icon text-red-600'
    : isDragging ? 'float text-slate-900 [--float-speed:0.7s]'
    : isHovered ? 'float text-slate-900'
    : 'text-slate-500'

  return (
    <div
      id="upload-zone"
      role="button"
      tabIndex={0}
      aria-label="Upload an .epos file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-9 text-center select-none ${tone}`}
      style={{
        transition: 'border-color 200ms var(--ease-out-quart), background-color 200ms var(--ease-out-quart), transform 350ms var(--ease-out-quart), box-shadow 350ms var(--ease-out-quart)',
        boxShadow: isDragging || (isHovered && !isDragInvalid) ? 'var(--shadow-raised)' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".epos"
        className="sr-only"
        onChange={handleFileChange}
        onClick={e => e.stopPropagation()}
      />

      <svg key={rejectKey} width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden className={iconMotion}>
        {isDragInvalid
          ? <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.25" />
          : <path d="M12 16V4M7 9l5-5 5 5M4 20h16" stroke="currentColor" strokeWidth="2" />}
      </svg>

      <p className={`m-0 text-step-1 font-bold ${isDragInvalid ? 'text-red-700' : 'text-slate-900'}`} aria-live="polite">
        {isDragInvalid ? 'Not an .epos file' : isDragging ? 'Release to upload' : 'Drop an .epos file'}
      </p>
      <p className={`m-0 ${isDragInvalid ? 'text-red-700' : 'text-slate-600'}`}>
        {isDragInvalid ? 'Only .epos files from an APT instrument are supported.' : 'or click to browse your files'}
      </p>
    </div>
  )
}
