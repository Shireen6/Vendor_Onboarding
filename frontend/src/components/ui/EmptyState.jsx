import React from 'react'
import clsx from 'clsx'

const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={clsx('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
)

export default EmptyState
