import type { ReactNode } from 'react'

interface SectionCardProps {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  noPad?: boolean
}

export function SectionCard({ title, actions, children, className = '', noPad }: SectionCardProps) {
  return (
    <div className={`section-card ${className}`}>
      {(title || actions) && (
        <div className="section-card__header">
          {title && <h2 className="section-card__title">{title}</h2>}
          {actions && <div className="section-card__actions">{actions}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'section-card__body'}>{children}</div>
    </div>
  )
}
