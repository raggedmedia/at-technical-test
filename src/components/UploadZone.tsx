import { useState, useRef } from 'react'
import { demoEdge } from '../lib/demoEdge'

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isDragInvalid, setIsDragInvalid] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [rejectKey, setRejectKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = isDragging || isHovered

  // .epos has no registered MIME type — its type is always ''
  // Any file with a known MIME type is definitively not .epos
  function isValidDrag(e: React.DragEvent): boolean {
    return Array.from(e.dataTransfer.items).every(
      item => item.kind !== 'file' || item.type === ''
    )
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (isValidDrag(e)) {
      setIsDragging(true)
      setIsDragInvalid(false)
    } else {
      setIsDragging(false)
      setIsDragInvalid(true)
    }
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

  return (
    <div
      id="upload-zone"
      role="button"
      tabIndex={0}
      aria-label="Upload .epos file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card flex flex-col items-center justify-center gap-4 py-16 cursor-pointer select-none outline-none"
      style={{
        transition: 'border-color 220ms var(--ease-out-quart), box-shadow 220ms var(--ease-out-quart), background-color 220ms var(--ease-out-quart)',
        ...((isDragInvalid || isActive) && {
          backgroundColor: 'var(--bg-card-hi)',
          borderColor: isDragInvalid
            ? 'rgba(239, 68, 68, 0.7)'
            : isDragging ? 'var(--green)' : 'rgba(34, 197, 94, 0.45)',
          backgroundImage: isDragInvalid
            ? 'linear-gradient(to bottom, rgba(239, 68, 68, 0.05) 0px, transparent 80px)'
            : 'linear-gradient(to bottom, rgba(34, 197, 94, 0.045) 0px, transparent 80px)',
          boxShadow: isDragInvalid
            ? `var(--shadow-level-2), 0 0 0 1px rgba(239,68,68,0.35), 0 0 32px rgba(239,68,68,0.1)`
            : isDragging
              ? `var(--shadow-level-2), 0 0 0 1px rgba(34,197,94,0.4), 0 0 48px rgba(34,197,94,0.12)`
              : `var(--shadow-level-2), 0 0 0 1px rgba(34,197,94,0.25), 0 0 32px rgba(34,197,94,0.07)`,
        }),
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

      {/* Icon — floats on hover/drag, shakes on rejection */}
      {isDragInvalid ? (
        <svg
          key={rejectKey}
          className="w-8 h-8 upload-icon-shake"
          style={{ color: 'var(--red)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ) : (
        <svg
          className={`w-8 h-8 transition-colors duration-220${isActive ? ' upload-icon-float' : ''}`}
          style={{ color: isActive ? 'var(--green)' : 'var(--text-dim)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      )}

      <div className="flex flex-col items-center gap-1.5 text-center">
        <p
          className="text-sm font-medium m-0"
          style={{
            color: isDragInvalid ? 'var(--red)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'color 220ms var(--ease-out-quart)',
          }}
        >
          {isDragInvalid ? 'Not an .epos file' : isDragging ? 'Release to upload' : 'Drop an .epos file'}
        </p>
        <p
          className="text-[12px] m-0"
          style={{
            color: isDragInvalid ? 'rgba(239, 68, 68, 0.6)' : isActive ? 'rgba(34, 197, 94, 0.65)' : 'var(--text-dim)',
            transition: 'color 220ms var(--ease-out-quart)',
          }}
        >
          {isDragInvalid ? 'Only .epos files are supported' : 'or click to browse'}
        </p>
      </div>
    </div>
  )
}
