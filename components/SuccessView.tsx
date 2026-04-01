import { RefundFormData } from '@/types'
import { formatDate } from '@/lib/utils'

interface SuccessViewProps {
  data: RefundFormData
  fileName?: string
  onReset: () => void
}

const summaryRows = [
  { key: 'name' as keyof RefundFormData, label: 'Full name' },
  { key: 'email' as keyof RefundFormData, label: 'Email address' },
  { key: 'booking_ref' as keyof RefundFormData, label: 'Booking reference' },
  { key: 'booking_date' as keyof RefundFormData, label: 'Booking date', format: formatDate },
  { key: 'reason' as keyof RefundFormData, label: 'Refund reason' },
  { key: 'details' as keyof RefundFormData, label: 'Additional details' },
]

export default function SuccessView({ data, fileName, onReset }: SuccessViewProps) {
  return (
    <div className="animate-fade-in max-w-xl mx-auto">

      <div
        className="rounded-2xl p-6 mb-6 flex items-start gap-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
          style={{ background: 'rgba(22,163,74,0.1)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10L8 14L16 6"
              stroke="var(--success)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            Request submitted successfully
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            We’ll review your request and respond within 2–3 business days.
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Submission summary
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Reference for your records
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {summaryRows.map(({ key, label, format }) => {
            const value = data[key]
            if (!value) return null

            return (
              <div key={key} className="flex items-start justify-between px-5 py-3.5 gap-4">
                <span className="text-sm w-40 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                  {label}
                </span>

                <span
                  className="text-sm text-right font-medium"
                  style={{ color: 'var(--text)', wordBreak: 'break-word' }}
                >
                  {format ? format(value as string) : value}
                </span>
              </div>
            )
          })}

          {fileName && (
            <div className="flex items-center justify-between px-5 py-3.5 gap-4">
              <span className="text-sm w-40 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                Uploaded file
              </span>

              <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 7h6M4 4.5h4M4 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {fileName}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-6 w-full py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
      >
        Submit another request
      </button>
    </div>
  )
}