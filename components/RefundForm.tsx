'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isOlderThan90Days } from '@/lib/utils'
import { RefundFormData, FormErrors } from '@/types'
import FormField from './FormField'
import SuccessView from './SuccessView'

const REFUND_REASONS = [
  'Property Issue',
  'Booking Error',
  'Personal Reasons',
  'Other',
] as const

const INITIAL_FORM: RefundFormData = {
  name: '',
  email: '',
  booking_ref: '',
  booking_date: '',
  reason: '',
  details: '',
}

function inputStyle(hasError?: string): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '12px',
    border: `1px solid ${hasError ? '#f87171' : 'var(--border)'}`,
    background: hasError ? 'rgba(239,68,68,0.05)' : 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    WebkitAppearance: 'none',
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function RefundForm() {
  const [form, setForm]               = useState<RefundFormData>(INITIAL_FORM)
  const [file, setFile]               = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileType, setFileType]       = useState<'image' | 'pdf' | 'other' | null>(null)
  const [errors, setErrors]           = useState<FormErrors>({})
  const [loading, setLoading]         = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitted, setSubmitted]     = useState<RefundFormData | null>(null)
  const [submittedFileName, setSubmittedFileName] = useState<string | undefined>()
  const [isDragging, setIsDragging]   = useState(false)
  const [isDark, setIsDark]           = useState(false)
  const [charCount, setCharCount]     = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const showWarning = isOlderThan90Days(form.booking_date)

  useEffect(() => {
    const html = document.documentElement
    isDark ? html.classList.add('dark') : html.classList.remove('dark')
  }, [isDark])

  const set =
    (field: keyof RefundFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value
      setForm(f => ({ ...f, [field]: val }))
      if (field === 'details') setCharCount(val.length)
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

  const validate = useCallback((): FormErrors => {
    const e: FormErrors = {}
    if (!form.name.trim())        e.name         = 'Full name is required'
    if (!form.email.trim())       e.email        = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  e.email        = 'Enter a valid email address'
    if (!form.booking_ref.trim()) e.booking_ref  = 'Booking reference is required'
    if (!form.booking_date) {
      e.booking_date = 'Booking date is required'
    } else {
      const todayStr = new Date().toISOString().split('T')[0]
      if (form.booking_date > todayStr) {
        e.booking_date = 'Booking date cannot be in the future'
      }
    }
    if (!form.reason)             e.reason       = 'Please select a reason'
    return e
  }, [form])

  const processFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10 MB.')
      return
    }
    setFile(f)
    if (f.type.startsWith('image/')) {
      setFileType('image')
      const reader = new FileReader()
      reader.onload = ev => setFilePreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else if (f.type === 'application/pdf') {
      setFileType('pdf')
      setFilePreview(null)
    } else {
      setFileType('other')
      setFilePreview(null)
    }
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setFilePreview(null)
    setFileType(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) processFile(dropped)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError(null)

    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      const firstKey = Object.keys(errs)[0]
      document.getElementById(firstKey)?.focus()
      return
    }

    setLoading(true)
    try {
      let file_url: string | null = null

      if (file) {
        const ext  = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('refund-files')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadErr) {
          // log but don't block — still save the form data
          console.error('File upload error:', uploadErr.message)
          setUploadError('File upload failed — form data will still be saved.')
        } else {
          const { data } = supabase.storage.from('refund-files').getPublicUrl(path)
          file_url = data.publicUrl
        }
      }

      const { error: dbErr } = await supabase
        .from('refunds')
        .insert([{ ...form, file_url }])

      if (dbErr) {
        console.error('DB insert error:', dbErr.message)
        throw new Error(dbErr.message)
      }

      setSubmitted(form)
      setSubmittedFileName(file?.name)
      setForm(INITIAL_FORM)
      setFile(null)
      setFilePreview(null)
      setFileType(null)
      setCharCount(0)
      setUploadError(null)
      if (fileRef.current) fileRef.current.value = ''

    } catch (err: any) {
      console.error('Submission error:', err)
      setUploadError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Nav isDark={isDark} onToggle={() => setIsDark(d => !d)} />
        <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 16px 80px' }}>
          <SuccessView
            data={submitted}
            fileName={submittedFileName}
            onReset={() => { setSubmitted(null); setSubmittedFileName(undefined) }}
          />
        </main>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav isDark={isDark} onToggle={() => setIsDark(d => !d)} />

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 14px 70px' }}>

        {/* heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
            Refund Request
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6, lineHeight: 1.55 }}>
            Submit your request for review. Our team will respond within 2–3 business days.
          </p>
        </div>

        {/* error banner (Supabase / network errors) */}
        {uploadError && (
          <div role="alert" style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 14, padding: '14px 16px', marginBottom: 20,
            animation: 'slideDown 0.25s ease-out',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.4"/>
              <path d="M8 4.5V8.5M8 10.5v.5" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>{uploadError}</p>
          </div>
        )}

        {/* 90-day warning banner — EXACT required wording */}
        {showWarning && (
          <div role="alert" style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: '#fefce8', border: '1px solid #fde047',
            borderRadius: 14, padding: '14px 16px', marginBottom: 20,
            animation: 'slideDown 0.25s ease-out',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M9 2L1.5 15.5h15L9 2z" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <path d="M9 7.5v3.5M9 12.5v.5" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 13, color: '#713f12', margin: 0, lineHeight: 1.55 }}>
              <strong style={{ fontWeight: 600 }}>Your booking is outside the standard refund window.</strong>
              {' '}Your request will be reviewed on a case-by-case basis.
            </p>
          </div>
        )}

        {/* form card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Full Name */}
            <FormField label="Full Name" error={errors.name}>
              <input
                id="name" type="text" autoComplete="name"
                placeholder="Your full name"
                value={form.name} onChange={set('name')}
                style={inputStyle(errors.name)}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = errors.name ? '#f87171' : '#94a3b8' }}
                onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.name ? '#f87171' : 'var(--border)' }}
              />
            </FormField>

            {/* Email */}
            <FormField label="Email Address" error={errors.email}>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={set('email')}
                style={inputStyle(errors.email)}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = errors.email ? '#f87171' : '#94a3b8' }}
                onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.email ? '#f87171' : 'var(--border)' }}
              />
            </FormField>

            {/* Booking Reference */}
            <FormField label="Booking Reference" error={errors.booking_ref}>
              <input
                id="booking_ref" type="text"
                placeholder="e.g. BK-2024-00123"
                value={form.booking_ref} onChange={set('booking_ref')}
                style={inputStyle(errors.booking_ref)}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = errors.booking_ref ? '#f87171' : '#94a3b8' }}
                onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.booking_ref ? '#f87171' : 'var(--border)' }}
              />
            </FormField>

            {/* Booking Date */}
            <FormField label="Booking Date" error={errors.booking_date}>
              <input
                id="booking_date" type="date"
                value={form.booking_date} onChange={set('booking_date')}
                max={new Date().toISOString().split('T')[0]}
                style={inputStyle(errors.booking_date)}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = errors.booking_date ? '#f87171' : '#94a3b8' }}
                onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.booking_date ? '#f87171' : 'var(--border)' }}
              />
            </FormField>

            {/* Refund Reason */}
            <FormField label="Refund Reason" error={errors.reason}>
              <div style={{ position: 'relative' }}>
                <select
                  id="reason"
                  value={form.reason} onChange={set('reason')}
                  style={{
                    ...inputStyle(errors.reason),
                    appearance: 'none',
                    paddingRight: 36,
                    color: form.reason ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer',
                  }}
                  onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = errors.reason ? '#f87171' : '#94a3b8' }}
                  onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = errors.reason ? '#f87171' : 'var(--border)' }}
                >
                  <option value="" disabled>Select a reason</option>
                  {REFUND_REASONS.map(r => (
                    <option key={r} value={r} style={{ color: 'var(--text)' }}>{r}</option>
                  ))}
                </select>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }}>
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </FormField>

            {/* Additional Details */}
            <FormField label="Additional Details" optional>
              <div style={{ position: 'relative' }}>
                <textarea
                  id="details" rows={4} maxLength={500}
                  placeholder="Describe the issue in detail — more context helps us resolve it faster."
                  value={form.details} onChange={set('details')}
                  style={{ ...inputStyle(), resize: 'none', paddingBottom: 28, lineHeight: 1.55 }}
                  onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = '#94a3b8' }}
                  onBlur={e  => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
                />
                <span style={{
                  position: 'absolute', bottom: 10, right: 12,
                  fontSize: 11,
                  color: charCount > 450 ? '#f59e0b' : 'var(--muted)',
                  transition: 'color 0.2s',
                }}>
                  {charCount}/500
                </span>
              </div>
            </FormField>

            {/* File Upload */}
            <FormField label="Upload Evidence" optional>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#3b82f6' : 'var(--border)'}`,
                  borderRadius: 14,
                  background: isDragging ? 'rgba(59,130,246,0.04)' : 'var(--bg)',
                  padding: file ? '16px' : '28px 16px',
                  cursor: file ? 'default' : 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  textAlign: 'center',
                }}
              >
                {!file ? (
                  <div>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                      style={{ margin: '0 auto 10px', display: 'block', color: 'var(--muted)' }}>
                      <path d="M16 22V12M16 12L11 17M16 12L21 17"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 22.5A5 5 0 008.5 13h.5A7 7 0 0123 12.5a5 5 0 013 9"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                      Drop a file here, or{' '}
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>click to browse</span>
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      JPG, PNG or PDF · Max 10 MB
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, textAlign: 'left' }}>
                    {/* thumbnail */}
                    <div style={{
                      width: 72, height: 72, flexShrink: 0,
                      borderRadius: 10, overflow: 'hidden',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {fileType === 'image' && filePreview ? (
                        <img
                          src={filePreview} alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : fileType === 'pdf' ? (
                        <div style={{ textAlign: 'center' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <rect x="3" y="1" width="18" height="22" rx="2.5" fill="#fef2f2" stroke="#fecaca" strokeWidth="1"/>
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', display: 'block', marginTop: 2 }}>PDF</span>
                        </div>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <rect x="3" y="1" width="18" height="22" rx="2.5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
                          <path d="M7 8h10M7 12h10M7 16h6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>

                    {/* file info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--text)',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0' }}>
                        {formatFileSize(file.size)}
                        {fileType === 'image' && ' · Image'}
                        {fileType === 'pdf'   && ' · PDF document'}
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button type="button" onClick={() => fileRef.current?.click()}
                          style={{
                            fontSize: 12, fontWeight: 500,
                            color: 'var(--text)', background: 'var(--border)',
                            border: 'none', borderRadius: 8,
                            padding: '5px 12px', cursor: 'pointer',
                          }}>
                          Change
                        </button>
                        <button type="button" onClick={removeFile}
                          style={{
                            fontSize: 12, fontWeight: 500,
                            color: '#dc2626', background: '#fef2f2',
                            border: '1px solid #fecaca', borderRadius: 8,
                            padding: '5px 12px', cursor: 'pointer',
                          }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileRef} type="file" accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }}
              />
            </FormField>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 14, border: 'none',
                background: loading ? '#94a3b8' : '#0f172a',
                color: '#ffffff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
                letterSpacing: '0.01em',
              }}
            >
              {loading && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>

          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
          Need help?{' '}
          <a href="mailto:support@deluxehomes.com"
            style={{ color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>
            Contact support
          </a>
        </p>
      </main>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        .dark input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        @media (max-width: 540px) {
          main { padding-top: 28px !important; padding-left: 12px !important; padding-right: 12px !important; }
          form  { padding: 18px 16px !important; border-radius: 16px !important; }
          h1    { font-size: 22px !important; }
        }
        @media (max-width: 360px) {
          main { padding-left: 8px !important; padding-right: 8px !important; }
          form  { padding: 14px 12px !important; }
        }
      `}</style>
    </div>
  )
}

function Nav({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: '#0f172a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="white" strokeWidth="1.3"/>
            <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Deluxe Operations Portal
        </span>
      </div>
      <button
        onClick={onToggle} aria-label="Toggle dark mode"
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg)', color: 'var(--muted)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        {isDark ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 1.5V3M8 13v1.5M14.5 8H13M3 8H1.5M12.54 3.46l-1.06 1.06M4.52 11.48l-1.06 1.06M12.54 12.54l-1.06-1.06M4.52 4.52L3.46 3.46"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 8.8A6 6 0 017.2 2.5 5.5 5.5 0 1013.5 8.8z"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </nav>
  )
}
