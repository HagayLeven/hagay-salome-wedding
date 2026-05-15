'use client'
import { motion } from 'framer-motion'
import { Trash2, Pencil, CheckCircle } from 'lucide-react'
import type { Quote, Installment } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface QuoteCardProps {
  quote: Quote
  index?: number
  onSelect: (id: string) => void
  onEdit: (quote: Quote) => void
  onDelete: (id: string) => void
  onToggleInstallment: (quoteId: string, installmentId: string, isPaid: boolean) => void
}

export default function QuoteCard({ quote, index = 0, onSelect, onEdit, onDelete, onToggleInstallment }: QuoteCardProps) {
  const { t } = useLang()
  const installments = quote.installments || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', damping: 24, stiffness: 280 }}
      style={{
        border: quote.isSelected ? '2px solid var(--gold)' : '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        background: quote.isSelected ? 'var(--gold-pale)' : 'white',
        overflow: 'hidden',
      }}
    >
      {/* Selected header strip */}
      {quote.isSelected && (
        <div style={{
          background: 'var(--gold)', color: 'white',
          fontSize: '0.72rem', fontWeight: 700,
          padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>★</span> {t('selectedQuote')}
        </div>
      )}

      <div style={{ padding: '1rem 1.1rem' }}>
        {/* Amount */}
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1, marginBottom: 4 }}>
          {formatILS(quote.amount)}
        </div>

        {/* Title */}
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--charcoal)', marginBottom: 4 }}>
          {quote.title}
        </div>

        {/* Note */}
        {quote.note && (
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-muted)', fontStyle: 'italic', marginBottom: 6 }}>
            {quote.note}
          </div>
        )}

        {/* Valid until */}
        {quote.validUntil && (
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', marginBottom: 8 }}>
            {t('validUntil')}: {formatDate(quote.validUntil)}
          </div>
        )}

        {/* Auto-budget badge */}
        {quote.isSelected && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: '0.72rem', color: '#2D7A55', fontWeight: 600,
            background: '#E8F5EE', borderRadius: 9999, padding: '2px 8px', marginBottom: 10,
          }}>
            <CheckCircle size={11} /> {t('autoBudget')}
          </div>
        )}

        {/* Installments */}
        {installments.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {t('installments')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {installments.map((inst: Installment) => (
                <div key={inst.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 8px', borderRadius: 8,
                  background: inst.isPaid ? '#E8F5EE' : 'var(--bg)',
                  border: `1px solid ${inst.isPaid ? '#B8E0C8' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => onToggleInstallment(quote.id, inst.id, !inst.isPaid)}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: inst.isPaid ? '#4CAF82' : 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      aria-label={inst.isPaid ? t('markUnpaid') : t('markPaid')}
                    >
                      {inst.isPaid && <CheckCircle size={11} color="white" />}
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--charcoal)' }}>{inst.label}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: inst.isPaid ? '#2D7A55' : 'var(--charcoal)' }}>
                    {formatILS(inst.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {!quote.isSelected && (
            <button
              className="btn btn-gold"
              style={{ flex: 1, fontSize: '0.78rem', padding: '6px 12px' }}
              onClick={() => onSelect(quote.id)}
            >
              {t('selectQuote')}
            </button>
          )}
          <button
            className="btn btn-outline"
            style={{ padding: '6px 10px', minWidth: 36 }}
            onClick={() => onEdit(quote)}
            aria-label={t('edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            className="btn"
            style={{ padding: '6px 10px', minWidth: 36, color: 'var(--danger)', border: '1px solid var(--border)', background: 'white' }}
            onClick={() => {
              if (confirm(t('delete') + '?')) onDelete(quote.id)
            }}
            aria-label={t('delete')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
