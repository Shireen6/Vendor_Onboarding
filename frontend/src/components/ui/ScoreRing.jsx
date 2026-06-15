import React from 'react'

const ScoreRing = ({ score = 0, size = 120, label }) => {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = () => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={getColor()} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">{label}</p>}
    </div>
  )
}

export default ScoreRing
