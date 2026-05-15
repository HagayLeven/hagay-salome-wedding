'use client'
import { useEffect, useState } from 'react'
import { quoteStore } from '@/lib/store'
import type { Quote } from '@/lib/types'

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

interface PriceBadgeProps {
  entityId: string
  entityType: Quote['entityType']
}

export default function PriceBadge({ entityId, entityType }: PriceBadgeProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    setQuotes(quoteStore.getByEntity(entityType, entityId))
  }, [entityId, entityType])

  if (quotes.length === 0) {
    return (
      <span style={{
        display: 'inline-block', fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px',
        borderRadius: 9999, background: 'var(--bg)', border: '1px solid var(--border)',
        color: 'var(--gray-muted)',
      }}>
        אין הצעות
      </span>
    )
  }

  const selected = quotes.find(q => q.isSelected)
  if (selected) {
    return (
      <span style={{
        display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
        borderRadius: 9999, background: '#E8F5EE', border: '1px solid #B8E0C8', color: '#2D7A55',
      }}>
        ✓ {formatILS(selected.amount)}
      </span>
    )
  }

  const amounts = quotes.map(q => q.amount)
  const min = Math.min(...amounts)
  const max = Math.max(...amounts)

  return (
    <span style={{
      display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
      borderRadius: 9999, background: 'var(--gold-pale)', border: '1px solid #E8D5B0', color: '#8B6914',
    }}>
      {quotes.length === 1 ? formatILS(min) : `${formatILS(min)} - ${formatILS(max)}`}
    </span>
  )
}
