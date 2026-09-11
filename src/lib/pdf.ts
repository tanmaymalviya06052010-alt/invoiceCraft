import jsPDF from 'jspdf'
import { Invoice } from '@/types/invoice'
import { format } from 'date-fns'
import { sanitizeString } from './validation'

/**
 * Sanitize text for PDF output - removes potentially dangerous characters
 */
const sanitizeForPDF = (text: string | undefined | null): string => {
  if (!text || typeof text !== 'string') return '-'
  // Remove control characters, limit length, sanitize
  return sanitizeString(text)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .substring(0, 500) // Limit length
    || '-'
}

/**
 * Validate invoice data before PDF generation
 */
const validateInvoice = (invoice: Invoice): boolean => {
  return !!(
    invoice &&
    typeof invoice.invoiceNumber === 'string' &&
    typeof invoice.total === 'number' &&
    !isNaN(invoice.total) &&
    invoice.total >= 0
  )
}

export const generatePDF = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Validate invoice data
  if (!validateInvoice(invoice)) {
    throw new Error('Invalid invoice data')
  }
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]
  const darkColor: [number, number, number] = [30, 41, 59]
  const grayColor: [number, number, number] = [100, 116, 139]
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Invoice title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 20, 28)
  
  // Invoice number (sanitized)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitizeForPDF(invoice.invoiceNumber), pageWidth - 20, 28, { align: 'right' })
  
  // From section
  let y = 55
  doc.setTextColor(...darkColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('FROM:', 20, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  y += 6
  if (invoice.fromName) {
    doc.text(sanitizeForPDF(invoice.fromName), 20, y)
    y += 5
  }
  if (invoice.fromEmail) {
    doc.text(sanitizeForPDF(invoice.fromEmail), 20, y)
    y += 5
  }
  if (invoice.fromPhone) {
    doc.text(sanitizeForPDF(invoice.fromPhone), 20, y)
    y += 5
  }
  if (invoice.fromAddress) {
    const lines = doc.splitTextToSize(sanitizeForPDF(invoice.fromAddress), 80)
    doc.text(lines, 20, y)
    y += lines.length * 4
  }
  
  // Client section
  y = 55
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', 120, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  y += 6
  if (invoice.clientName) {
    doc.text(sanitizeForPDF(invoice.clientName), 120, y)
    y += 5
  }
  if (invoice.clientEmail) {
    doc.text(sanitizeForPDF(invoice.clientEmail), 120, y)
    y += 5
  }
  if (invoice.clientAddress) {
    const lines = doc.splitTextToSize(sanitizeForPDF(invoice.clientAddress), 80)
    doc.text(lines, 120, y)
    y += lines.length * 4
  }
  
  // Dates
  y = 55
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Date:', 150, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  
  try {
    const createdDate = new Date(invoice.createdAt)
    if (!isNaN(createdDate.getTime())) {
      doc.text(format(createdDate, 'MMM d, yyyy'), 150, y + 6)
    }
  } catch {
    doc.text('-', 150, y + 6)
  }
  
  y += 14
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Due Date:', 150, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  
  try {
    const dueDate = new Date(invoice.dueDate)
    if (!isNaN(dueDate.getTime())) {
      doc.text(format(dueDate, 'MMM d, yyyy'), 150, y + 6)
    }
  } catch {
    doc.text('-', 150, y + 6)
  }
  
  // Items table header
  y = 110
  doc.setFillColor(241, 245, 249)
  doc.rect(20, y, pageWidth - 40, 10, 'F')
  
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DESCRIPTION', 24, y + 7)
  doc.text('QTY', 120, y + 7)
  doc.text('RATE', 140, y + 7)
  doc.text('AMOUNT', pageWidth - 24, y + 7, { align: 'right' })
  
  // Items
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  // Limit items to prevent overflow
  const maxItems = Math.min(invoice.items.length, 50)
  
  for (let index = 0; index < maxItems; index++) {
    const item = invoice.items[index]
    if (!item) continue
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(20, y - 4, pageWidth - 40, 10, 'F')
    }
    
    doc.setTextColor(...grayColor)
    const descText = sanitizeForPDF(item.description)
    const descLines = doc.splitTextToSize(descText, 90)
    doc.text(descLines[0] || '-', 24, y + 3)
    
    // Validate numbers before displaying
    const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0
    const rate = typeof item.rate === 'number' && !isNaN(item.rate) ? item.rate : 0
    const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0
    
    doc.text(qty.toString(), 120, y + 3)
    doc.text(`$${rate.toFixed(2)}`, 140, y + 3)
    doc.text(`$${amount.toFixed(2)}`, pageWidth - 24, y + 3, { align: 'right' })
    
    y += 10
  }
  
  // Totals
  y += 10
  doc.setDrawColor(226, 232, 240)
  doc.line(120, y, pageWidth - 20, y)
  
  y += 8
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  
  const subtotal = typeof invoice.subtotal === 'number' && !isNaN(invoice.subtotal) ? invoice.subtotal : 0
  const taxAmount = typeof invoice.taxAmount === 'number' && !isNaN(invoice.taxAmount) ? invoice.taxAmount : 0
  const total = typeof invoice.total === 'number' && !isNaN(invoice.total) ? invoice.total : 0
  const taxRate = typeof invoice.taxRate === 'number' && !isNaN(invoice.taxRate) ? invoice.taxRate : 0
  
  doc.text('Subtotal:', 130, y)
  doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 24, y, { align: 'right' })
  
  if (taxRate > 0) {
    y += 7
    doc.text(`Tax (${taxRate}%):`, 130, y)
    doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - 24, y, { align: 'right' })
  }
  
  y += 10
  doc.setFillColor(59, 130, 246)
  doc.rect(120, y - 5, pageWidth - 140, 12, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', 130, y + 3)
  doc.text(`$${total.toFixed(2)}`, pageWidth - 24, y + 3, { align: 'right' })
  
  // Notes (sanitized, limited length)
  if (invoice.notes && typeof invoice.notes === 'string') {
    y += 30
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 20, y)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    const sanitizedNotes = sanitizeForPDF(invoice.notes).substring(0, 500)
    const noteLines = doc.splitTextToSize(sanitizedNotes, pageWidth - 40)
    doc.text(noteLines.slice(0, 10), 20, y + 6) // Limit to 10 lines
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setTextColor(...grayColor)
  doc.setFontSize(8)
  doc.text('Created with InvoiceCraft - Simple invoicing for freelancers', pageWidth / 2, footerY, { align: 'center' })
  
  return doc
}

export const downloadPDF = (invoice: Invoice): void => {
  try {
    const doc = generatePDF(invoice)
    // Sanitize filename
    const filename = sanitizeForPDF(invoice.invoiceNumber).replace(/[^a-zA-Z0-9\-_]/g, '_')
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF')
  }
}
