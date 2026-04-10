import React from 'react'
import { Badge } from '@mantine/core'

const getColor = (status?: string) => {
  const s = (status || '').toLowerCase()
  if (s === 'confirmed' || s === 'done' || s === 'completed') return 'green'
  if (s === 'waiting' || s === 'pending' || s === 'scheduled') return 'blue'
  if (s === 'cancelled' || s === 'canceled' || s === 'rejected') return 'red'
  return 'gray'
}

const StatusBadge: React.FC<{ status?: string; size?: 'xs'|'sm'|'md' }> = ({ status, size = 'xs' }) => (
  <Badge color={getColor(status)} variant="light" size={size}>{status ?? '—'}</Badge>
)

export default StatusBadge
