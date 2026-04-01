export function isOlderThan90Days(dateString: string): boolean {
  if (!dateString) return false

  const bookingDate = new Date(dateString)
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - bookingDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  return diffDays > 90
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function validateEmail(email: string): boolean {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generateFilePath(fileName: string): string {
  const ext = fileName.split('.').pop()
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${unique}.${ext}`
}

export function fileSizeInKB(size: number): string {
  return `${(size / 1024).toFixed(0)} KB`
}