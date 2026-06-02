import * as React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-2xl border border-line bg-card shadow-lg', className)}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export const MiniCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border border-line bg-card2 p-5', className)}
      {...props}
    />
  ),
)
MiniCard.displayName = 'MiniCard'
