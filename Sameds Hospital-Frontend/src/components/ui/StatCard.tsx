import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  sub?: string
  variant?: 'default' | 'green' | 'red' | 'blue' | 'yellow' | 'purple'
  onClick?: () => void
}

export function StatCard({ label, value, icon, sub, variant = 'default', onClick }: StatCardProps) {
  return (
    <div
      className={`stat-card stat-card--${variant}${onClick ? ' stat-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <strong className="stat-card__value">{value}</strong>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </div>
  )
}
