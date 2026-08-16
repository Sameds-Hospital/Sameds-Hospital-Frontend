import type { ReactNode } from 'react'

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'orange' | 'teal'

const variantClass: Record<BadgeVariant, string> = {
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  blue: 'badge-blue',
  purple: 'badge-purple',
  gray: 'badge-gray',
  orange: 'badge-orange',
  teal: 'badge-teal',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
}

export function Badge({ variant = 'gray', children, dot }: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}

/** Map common status strings to badge variants */
export function statusVariant(status: string): BadgeVariant {
  const s = status.toLowerCase()
  if (['active', 'completed', 'paid', 'available', 'in stock', 'sent', 'approved', 'administered', 'eligible', 'confirmed', 'discharged'].some(k => s.includes(k))) return 'green'
  if (['critical', 'overdue', 'failed', 'expired', 'rejected', 'cancelled', 'out of stock', 'emergency', 'deceased', 'deferred'].some(k => s.includes(k))) return 'red'
  if (['pending', 'low stock', 'in review', 'requested', 'draft', 'due', 'scheduled', 'reserved'].some(k => s.includes(k))) return 'yellow'
  if (['booked', 'in progress', 'admitted', 'collected', 'issued', 'partial'].some(k => s.includes(k))) return 'blue'
  if (['on call', 'urgent', 'stat', 'stat'].some(k => s.includes(k))) return 'orange'
  if (['telemedicine', 'video', 'chronic'].some(k => s.includes(k))) return 'teal'
  if (['refunded', 'transferred', 'suspended'].some(k => s.includes(k))) return 'purple'
  return 'gray'
}
