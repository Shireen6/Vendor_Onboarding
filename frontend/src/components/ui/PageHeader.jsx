import React from 'react'

const PageHeader = ({ title, description, actions, badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {badge}
      </div>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
)

export default PageHeader
