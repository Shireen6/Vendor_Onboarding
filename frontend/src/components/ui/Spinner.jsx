import React from 'react'
import clsx from 'clsx'

const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={clsx('animate-spin rounded-full border-2 border-primary-200 border-t-primary-600', sizes[size], className)} />
  )
}

export default Spinner
