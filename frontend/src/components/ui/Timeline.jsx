import React from 'react'
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'
import clsx from 'clsx'

const icons = {
  completed: CheckCircle,
  in_progress: Clock,
  pending: Circle,
  failed: XCircle,
}

const colors = {
  completed: 'text-emerald-500',
  in_progress: 'text-primary-500',
  pending: 'text-slate-300 dark:text-slate-600',
  failed: 'text-red-500',
}

const lineColors = {
  completed: 'bg-emerald-300 dark:bg-emerald-700',
  in_progress: 'bg-primary-300 dark:bg-primary-700',
  pending: 'bg-slate-200 dark:bg-slate-700',
  failed: 'bg-red-300 dark:bg-red-700',
}

const Timeline = ({ steps = [] }) => (
  <div className="space-y-0">
    {steps.map((step, index) => {
      const Icon = icons[step.status] || Circle
      const isLast = index === steps.length - 1

      return (
        <div key={step.stage || index} className="flex gap-4 group">
          <div className="flex flex-col items-center">
            <div className={clsx('p-0.5 rounded-full transition-transform group-hover:scale-110', colors[step.status])}>
              <Icon className="w-5 h-5" />
            </div>
            {!isLast && (
              <div className={clsx('w-0.5 flex-1 min-h-[2rem] my-1 rounded-full', lineColors[step.status] || lineColors.pending)} />
            )}
          </div>
          <div className="pb-6 flex-1">
            <p className={clsx(
              'font-medium text-sm',
              step.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
            )}>
              {step.label}
            </p>
            {step.completedAt && (
              <p className="text-xs text-slate-400 mt-0.5">{new Date(step.completedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )
    })}
  </div>
)

export default Timeline
