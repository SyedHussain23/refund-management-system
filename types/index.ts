export type RefundReason =
  | 'Property Issue'
  | 'Booking Error'
  | 'Personal Reasons'
  | 'Other'
  | ''

export interface RefundFormData {
  name: string
  email: string
  booking_ref: string
  booking_date: string
  reason: RefundReason
  details: string
}

export interface RefundRecord extends RefundFormData {
  id: string
  file_url: string | null
  created_at: string
}

export interface FormErrors {
  name?: string
  email?: string
  booking_ref?: string
  booking_date?: string
  reason?: string
}

export interface FileUploadState {
  file: File | null
  preview: string | null
}