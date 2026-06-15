import React from 'react'
import clsx from 'clsx'

export const Skeleton = ({ className }) => (
  <div className={clsx('skeleton', className)} />
)

export const SkeletonCard = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-full" />
  </div>
)

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
)

export const DashboardSkeleton = () => (
  <div className="page-container">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  </div>
)

export default Skeleton
