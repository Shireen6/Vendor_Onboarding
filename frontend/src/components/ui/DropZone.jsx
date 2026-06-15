import React, { useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { Upload, FileText, CheckCircle, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import Spinner from './Spinner'

const DropZone = ({ label, doc, onUpload, onDelete, uploading, accept = '.pdf,.jpg,.jpeg,.png,.webp' }) => {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = useCallback((files) => {
    const file = files?.[0]
    if (file) onUpload(file)
  }, [onUpload])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  return (
    <div
      className={clsx(
        'card-hover p-5 border-2 border-dashed transition-all duration-300',
        dragOver && 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 scale-[1.01]',
        doc ? 'border-emerald-300/60 dark:border-emerald-700/40 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-slate-700'
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary-500/10">
            <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{label}</h4>
        </div>
        <StatusBadge status={doc?.status || 'missing'} />
      </div>

      {doc ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{doc.originalName}</span>
          </div>
          {doc.extractedData?.confidence > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${doc.extractedData.confidence}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{doc.extractedData.confidence}% AI match</span>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn btn-secondary text-xs flex-1">
              Replace
            </button>
            <button onClick={() => onDelete(doc._id)} className="btn btn-secondary text-xs text-red-600 dark:text-red-400 px-3">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full py-8 flex flex-col items-center gap-3 rounded-xl
                     text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400
                     hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all"
        >
          {uploading ? (
            <Spinner size="md" />
          ) : (
            <div className={clsx('p-3 rounded-2xl transition-colors', dragOver ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-slate-100 dark:bg-slate-800')}>
              <Upload className="w-6 h-6" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">{uploading ? 'Uploading & analyzing...' : 'Drag & drop or click to upload'}</p>
            <p className="text-xs mt-1 opacity-70">PDF, JPG, PNG up to 10MB</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        className="hidden"
      />
    </div>
  )
}

export default DropZone
