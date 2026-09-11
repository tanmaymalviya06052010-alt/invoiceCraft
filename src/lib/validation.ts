/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
}

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return ''
  
  // Only allow valid email characters
  return email
    .replace(/[^a-zA-Z0-9@._-]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true // Phone is optional
  // Allow digits, spaces, dashes, parentheses, plus sign
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7
}

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return ''
  // Allow only valid phone characters
  return phone.replace(/[^\d\s\-\+\(\)]/g, '').trim()
}

/**
 * Validate and sanitize numeric input
 */
export const sanitizeNumber = (value: string | number, min: number = 0, max: number = Infinity): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return min
  if (num < min) return min
  if (num > max) return max
  
  return Math.round(num * 100) / 100 // Round to 2 decimal places
}

/**
 * Generate a secure random ID
 */
export const generateSecureId = (): string => {
  const array = new Uint8Array(16)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    // Fallback for server-side (though this is client-only app)
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate unpredictable invoice number
 */
export const generateInvoiceNumber = (prefix: string = 'INV'): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Sanitize invoice data before storage
 */
export const sanitizeInvoiceData = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      if (key.includes('email')) {
        sanitized[key] = sanitizeEmail(value)
      } else if (key.includes('phone')) {
        sanitized[key] = sanitizePhone(value)
      } else {
        sanitized[key] = sanitizeString(value)
      }
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeInvoiceData(item as Record<string, unknown>)
          : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}
