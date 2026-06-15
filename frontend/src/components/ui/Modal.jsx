import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

const Modal = ({ open, onClose, title, subtitle, children, size = 'lg', footer }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={clsx(
        'relative w-full glass rounded-2xl shadow-elevated animate-slide-up',
        sizes[size]
      )}>
        <div className="flex items-start justify-between p-6 border-b border-slate-200/80 dark:border-slate-700/80">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
