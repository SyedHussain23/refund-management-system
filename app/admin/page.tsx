'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RefundRecord } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Property Issue': { bg: '#fef3c7', text: '#92400e' },
  'Booking Error': { bg: '#dbeafe', text: '#1e40af' },
  'Personal Reasons': { bg: '#f3e8ff', text: '#6b21a8' },
  Other: { bg: '#f1f5f9', text: '#475569' },
}

function exportCSV(records: RefundRecord[]) {
  const headers = ['Name', 'Email', 'Booking Ref', 'Booking Date', 'Reason', 'Details', 'File', 'Submitted At']

  const rows = records.map(r => [
    r.name,
    r.email,
    r.booking_ref,
    r.booking_date,
    r.reason,
    r.details ?? '',
    r.file_url ?? '',
    new Date(r.created_at).toLocaleString(),
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `refunds-${Date.now()}.csv`
  a.click()

  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [records, setRecords] = useState<RefundRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [reasonFilter, setReasonFilter] = useState('All')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('refunds')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setRecords(data)
      setLoading(false)
    }

    fetch()
  }, [])

  const filtered = records.filter(r => {
    const s = search.toLowerCase()

    const matchSearch =
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.booking_ref.toLowerCase().includes(s)

    const matchReason = reasonFilter === 'All' || r.reason === reasonFilter

    return matchSearch && matchReason
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            Refund Requests
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {records.length} total submissions
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => exportCSV(filtered)}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--text)', color: '#fff' }}
          >
            Export CSV
          </button>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 min-w-52 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-black/20"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          />

          <select
            value={reasonFilter}
            onChange={e => setReasonFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <option value="All">All</option>
            <option>Property Issue</option>
            <option>Booking Error</option>
            <option>Personal Reasons</option>
            <option>Other</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--muted)' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--muted)' }}>
            No results found
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Name', 'Email', 'Ref', 'Date', 'Reason', 'Details'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(r => {
                    const color = STATUS_COLORS[r.reason] ?? STATUS_COLORS['Other']

                    return (
                      <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 font-medium">{r.name}</td>
                        <td className="px-4 py-3">{r.email}</td>
                        <td className="px-4 py-3 font-mono">{r.booking_ref}</td>
                        <td className="px-4 py-3">{formatDate(r.booking_date)}</td>

                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: color.bg, color: color.text }}
                          >
                            {r.reason}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs truncate max-w-xs">
                          {r.details || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}