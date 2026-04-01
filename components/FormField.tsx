import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  optional?: boolean
  error?: string
  children: ReactNode
}

export default function FormField({
  label,
  optional,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-medium"
        style={{ color: 'var(--text)' }}
      >
        {label}

        {optional && (
          <span
            className="ml-1 text-xs"
            style={{ color: 'var(--muted)' }}
          >
            {' '}
            (optional)
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 animate-slide-down">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path
              d="M6 3.5V6.5M6 8.5V9"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}