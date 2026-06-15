import React from 'react'
import clsx from 'clsx'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-600/20',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 ring-blue-600/20',
  under_review: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 ring-indigo-600/20',
  uploaded: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-slate-600/20',
  missing: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ring-red-600/20',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-600/20',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ring-red-600/20',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  compliant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  partially_compliant: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  non_compliant: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const StatusBadge = ({ status, label }) => {
  const display = label || status?.replace(/_/g, ' ')
  return (
    <span className={clsx('badge capitalize ring-1 ring-inset', statusStyles[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {display}
    </span>
  )
}

export default StatusBadge
