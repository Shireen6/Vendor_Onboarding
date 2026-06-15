import React from 'react'
import clsx from 'clsx'

const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary', className }) => {
  const iconColors = {
    primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  }

  return (
    <div className={clsx('card-hover p-6 group', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {subtitle && (
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</div>
          )}
          {trend && (
            <p className={clsx('text-xs font-medium mt-1', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
              {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl transition-transform group-hover:scale-110', iconColors[color])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export default KPICard
