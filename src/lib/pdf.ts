import jsPDF from 'jspdf'
import { Invoice } from '@/types/invoice'
import { format } from 'date-fns'
import { sanitizeString } from './validation'

/**
 * Sanitize text for PDF output
 */
const sanitizeForPDF = (text: string | undefined | null): string => {
  if (!text || typeof text !== 'string') return ''
  return sanitizeString(text)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .substring(0, 500)
    || ''
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
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  if (!validateInvoice(invoice)) {
    throw new Error('Invalid invoice data')
  }
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]
  const darkColor: [number, number, number] = [30, 41, 59]
  const grayColor: [number, number, number] = [100, 116, 139]
  const lightGray: [number, number, number] = [241, 245, 249]
  
  // ========== HEADER ==========
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Invoice title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', margin, 30)
  
  // Invoice number
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitizeForPDF(invoice.invoiceNumber), pageWidth - margin, 30, { align: 'right' })
  
  // ========== FROM / BILL TO / DATES ==========
  let y = 60
  const leftCol = margin
  const midCol = 80
  const rightCol = 140
  
  // FROM section
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('FROM', leftCol, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  
  y = 68
  if (invoice.fromName) {
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitizeForPDF(invoice.fromName), leftCol, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    y += 5
  }
  if (invoice.fromEmail) {
    doc.text(sanitizeForPDF(invoice.fromEmail), leftCol, y)
    y += 5
  }
  if (invoice.fromPhone) {
    doc.text(sanitizeForPDF(invoice.fromPhone), leftCol, y)
    y += 5
  }
  if (invoice.fromAddress) {
    const lines = doc.splitTextToSize(sanitizeForPDF(invoice.fromAddress), 55)
    doc.text(lines, leftCol, y)
  }
  
  // BILL TO section
  y = 60
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', midCol, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  
  y = 68
  if (invoice.clientName) {
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitizeForPDF(invoice.clientName), midCol, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    y += 5
  }
  if (invoice.clientEmail) {
    doc.text(sanitizeForPDF(invoice.clientEmail), midCol, y)
    y += 5
  }
  if (invoice.clientAddress) {
    const lines = doc.splitTextToSize(sanitizeForPDF(invoice.clientAddress), 55)
    doc.text(lines, midCol, y)
  }
  
  // DATES section (right column)
  y = 60
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE DATE', rightCol, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  y = 68
  
  try {
    const createdDate = new Date(invoice.createdAt)
    if (!isNaN(createdDate.getTime())) {
      doc.text(format(createdDate, 'MMM d, yyyy'), rightCol, y)
    }
  } catch {
    doc.text('-', rightCol, y)
  }
  
  y += 12
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DUE DATE', rightCol, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  y += 8
  
  try {
    const dueDate = new Date(invoice.dueDate)
    if (!isNaN(dueDate.getTime())) {
      doc.text(format(dueDate, 'MMM d, yyyy'), rightCol, y)
    }
  } catch {
    doc.text('-', rightCol, y)
  }
  
  // ========== ITEMS TABLE ==========
  y = 105
  
  // Table header background
  doc.setFillColor(...lightGray)
  doc.rect(margin, y, contentWidth, 8, 'F')
  
  // Table header text
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DESCRIPTION', margin + 2, y + 5.5)
  doc.text('QTY', margin + 115, y + 5.5)
  doc.text('RATE', margin + 135, y + 5.5)
  doc.text('AMOUNT', pageWidth - margin - 2, y + 5.5, { align: 'right' })
  
  // Table rows
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const maxItems = Math.min(invoice.items.length, 50)
  
  for (let index = 0; index < maxItems; index++) {
    const item = invoice.items[index]
    if (!item) continue
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - 3, contentWidth, 8, 'F')
    }
    
    // Row border
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, y + 5, pageWidth - margin, y + 5)
    
    doc.setTextColor(...grayColor)
    
    // Description
    const descText = sanitizeForPDF(item.description) || '-'
    const descLines = doc.splitTextToSize(descText, 90)
    doc.text(descLines[0] || '-', margin + 2, y + 3)
    
    // Numbers
    const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0
    const rate = typeof item.rate === 'number' && !isNaN(item.rate) ? item.rate : 0
    const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0
    
    doc.text(qty.toString(), margin + 118, y + 3)
    doc.text(`$${rate.toFixed(2)}`, margin + 135, y + 3)
    doc.text(`$${amount.toFixed(2)}`, pageWidth - margin - 2, y + 3, { align: 'right' })
    
    y += 8
  }
  
  // ========== TOTALS ==========
  y += 8
  
  // Divider line
  doc.setDrawColor(226, 232, 240)
  doc.line(pageWidth - margin - 65, y, pageWidth - margin, y)
  
  y += 8
  doc.setFontSize(10)
  
  const subtotal = typeof invoice.subtotal === 'number' && !isNaN(invoice.subtotal) ? invoice.subtotal : 0
  const taxAmount = typeof invoice.taxAmount === 'number' && !isNaN(invoice.taxAmount) ? invoice.taxAmount : 0
  const total = typeof invoice.total === 'number' && !isNaN(invoice.total) ? invoice.total : 0
  const taxRate = typeof invoice.taxRate === 'number' && !isNaN(invoice.taxRate) ? invoice.taxRate : 0
  
  // Subtotal
  doc.setTextColor(...grayColor)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal', pageWidth - margin - 65, y)
  doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' })
  
  // Tax (if applicable)
  if (taxRate > 0) {
    y += 8
    doc.text(`Tax (${taxRate}%)`, pageWidth - margin - 65, y)
    doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' })
  }
  
  // Total box
  y += 10
  doc.setFillColor(...primaryColor)
  doc.roundedRect(pageWidth - margin - 68, y - 5, 70, 12, 2, 2, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL', pageWidth - margin - 63, y + 3)
  doc.text(`$${total.toFixed(2)}`, pageWidth - margin - 5, y + 3, { align: 'right' })
  
  // ========== NOTES ==========
  if (invoice.notes && typeof invoice.notes === 'string' && invoice.notes.trim()) {
    y += 25
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('NOTES', margin, y)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.setFontSize(10)
    const sanitizedNotes = sanitizeForPDF(invoice.notes).substring(0, 500)
    const noteLines = doc.splitTextToSize(sanitizedNotes, contentWidth)
    doc.text(noteLines.slice(0, 5), margin, y + 8)
  }
  
  // ========== FOOTER ==========
  doc.setTextColor(...grayColor)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Created with InvoiceCraft', pageWidth / 2, pageHeight - 15, { align: 'center' })
  
  return doc
}

export const downloadPDF = (invoice: Invoice): void => {
  try {
    const doc = generatePDF(invoice)
    const filename = sanitizeForPDF(invoice.invoiceNumber).replace(/[^a-zA-Z0-9\-_]/g, '_') || 'invoice'
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF')
  }
}
