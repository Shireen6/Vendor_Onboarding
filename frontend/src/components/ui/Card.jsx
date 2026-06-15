import React from 'react'
import clsx from 'clsx'

const Card = ({ title, subtitle, children, className = '', action, glass = false, noPadding = false }) => (
  <div className={clsx(glass ? 'glass rounded-2xl' : 'card', className)}>
    {(title || action) && (
      <div className={clsx(
        'flex items-start justify-between',
        noPadding ? 'px-6 pt-6' : 'p-6 pb-0'
      )}>
        <div>
          {title && <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className={noPadding ? '' : (title || action ? 'p-6 pt-4' : 'p-6')}>
      {children}
    </div>
  </div>
)

export default Card
