import jsPDF from 'jspdf'
import { Invoice, InvoiceTemplate } from '@/types/invoice'
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

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [59, 130, 246]
}

/**
 * Generate PDF header based on template
 */
const generateHeader = (
  doc: jsPDF, 
  invoice: Invoice, 
  pageWidth: number, 
  margin: number, 
  brandColor: [number, number, number],
  template: InvoiceTemplate
): void => {
  const headerHeight = template === 'minimal' ? 50 : 45
  
  if (template === 'minimal') {
    // Minimal - clean white header with thin border
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, 45, pageWidth - margin, 45)
  } else if (template === 'modern') {
    // Modern - side accent bar
    doc.setFillColor(...brandColor)
    doc.rect(0, 0, 6, headerHeight, 'F')
  } else if (template === 'creative') {
    // Creative - gradient effect (simulated with two rectangles)
    doc.setFillColor(...brandColor)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    doc.setFillColor(brandColor[0], brandColor[1], brandColor[2])
    doc.rect(0, headerHeight - 8, pageWidth, 8, 'F')
  } else {
    // Professional - full header
    doc.setFillColor(...brandColor)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
  }
  
  // Logo
  let titleX = margin
  if (invoice.logo) {
    try {
      doc.addImage(invoice.logo, 'PNG', margin, 10, 35, 22)
      titleX = margin + 40
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error)
    }
  }
  
  // Invoice title
  const titleY = template === 'minimal' ? 35 : 28
  if (template === 'minimal') {
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(32)
  } else {
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
  }
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', titleX, titleY)
  
  // Invoice number
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  if (template === 'minimal') {
    doc.setTextColor(100, 116, 139)
  } else {
    doc.setTextColor(255, 255, 255)
  }
  doc.text(sanitizeForPDF(invoice.invoiceNumber), pageWidth - margin, titleY, { align: 'right' })
}

/**
 * Generate PDF body items table
 */
const generateItemsTable = (
  doc: jsPDF,
  invoice: Invoice,
  margin: number,
  pageWidth: number,
  contentWidth: number,
  startY: number,
  brandColor: [number, number, number],
  template: InvoiceTemplate
): number => {
  const currencySymbol = invoice.currencySymbol || '$'
  let y = startY
  
  // Table header
  if (template === 'minimal') {
    doc.setDrawColor(180, 180, 180)
    doc.line(margin, y, pageWidth - margin, y)
  } else {
    doc.setFillColor(241, 245, 249)
    doc.rect(margin, y, contentWidth, 8, 'F')
  }
  
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DESCRIPTION', margin + 2, y + 5.5)
  doc.text('QTY', margin + 115, y + 5.5)
  doc.text('RATE', margin + 135, y + 5.5)
  doc.text('AMOUNT', pageWidth - margin - 2, y + 5.5, { align: 'right' })
  
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const maxItems = Math.min(invoice.items.length, 50)
  
  for (let index = 0; index < maxItems; index++) {
    const item = invoice.items[index]
    if (!item) continue
    
    // Alternating row background
    if (template !== 'minimal' && index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - 3, contentWidth, 8, 'F')
    }
    
    // Row border
    if (template === 'minimal') {
      doc.setDrawColor(230, 230, 230)
    } else {
      doc.setDrawColor(226, 232, 240)
    }
    doc.line(margin, y + 5, pageWidth - margin, y + 5)
    
    doc.setTextColor(100, 116, 139)
    
    const descText = sanitizeForPDF(item.description) || '-'
    const descLines = doc.splitTextToSize(descText, 90)
    doc.text(descLines[0] || '-', margin + 2, y + 3)
    
    const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0
    const rate = typeof item.rate === 'number' && !isNaN(item.rate) ? item.rate : 0
    const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0
    
    doc.text(qty.toString(), margin + 118, y + 3)
    doc.text(`${currencySymbol}${rate.toFixed(2)}`, margin + 135, y + 3)
    doc.text(`${currencySymbol}${amount.toFixed(2)}`, pageWidth - margin - 2, y + 3, { align: 'right' })
    
    y += 8
  }
  
  return y
}

/**
 * Generate PDF totals section
 */
const generateTotals = (
  doc: jsPDF,
  invoice: Invoice,
  margin: number,
  pageWidth: number,
  startY: number,
  brandColor: [number, number, number],
  template: InvoiceTemplate
): number => {
  const currencySymbol = invoice.currencySymbol || '$'
  let y = startY + 8
  
  const subtotal = typeof invoice.subtotal === 'number' && !isNaN(invoice.subtotal) ? invoice.subtotal : 0
  const taxAmount = typeof invoice.taxAmount === 'number' && !isNaN(invoice.taxAmount) ? invoice.taxAmount : 0
  const total = typeof invoice.total === 'number' && !isNaN(invoice.total) ? invoice.total : 0
  const taxRate = typeof invoice.taxRate === 'number' && !isNaN(invoice.taxRate) ? invoice.taxRate : 0
  
  // Divider
  if (template === 'minimal') {
    doc.setDrawColor(180, 180, 180)
  } else {
    doc.setDrawColor(226, 232, 240)
  }
  doc.line(pageWidth - margin - 65, y, pageWidth - margin, y)
  
  y += 8
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  
  doc.text('Subtotal', pageWidth - margin - 65, y)
  doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' })
  
  if (taxRate > 0) {
    y += 8
    doc.text(`Tax (${taxRate}%)`, pageWidth - margin - 65, y)
    doc.text(`${currencySymbol}${taxAmount.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' })
  }
  
  y += 10
  
  if (template === 'creative') {
    // Creative - rounded box
    doc.setFillColor(...brandColor)
    doc.roundedRect(pageWidth - margin - 68, y - 5, 70, 12, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
  } else if (template === 'modern') {
    // Modern - bold bar
    doc.setFillColor(...brandColor)
    doc.rect(pageWidth - margin - 68, y - 5, 70, 12, 'F')
    doc.setTextColor(255, 255, 255)
  } else if (template === 'minimal') {
    // Minimal - simple text
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
  } else {
    // Professional - rounded box
    doc.setFillColor(...brandColor)
    doc.roundedRect(pageWidth - margin - 68, y - 5, 70, 12, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL', pageWidth - margin - 63, y + 3)
  doc.text(`${currencySymbol}${total.toFixed(2)}`, pageWidth - margin - 5, y + 3, { align: 'right' })
  
  return y
}

/**
 * Main PDF generation function
 */
export const generatePDF = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  if (!validateInvoice(invoice)) {
    throw new Error('Invalid invoice data')
  }
  
  const brandColor = hexToRgb(invoice.brandColor || '#3b82f6')
  const darkColor: [number, number, number] = [30, 41, 59]
  const grayColor: [number, number, number] = [100, 116, 139]
  const template = invoice.template || 'professional'
  
  // Generate header
  generateHeader(doc, invoice, pageWidth, margin, brandColor, template)
  
  // FROM / BILL TO / DATES section
  let y = template === 'minimal' ? 60 : 58
  const leftCol = margin
  const midCol = 80
  const rightCol = 140
  
  // FROM
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
  
  // BILL TO
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
  
  // DATES
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
  
  // Items table
  const tableStartY = 105
  const tableEndY = generateItemsTable(doc, invoice, margin, pageWidth, contentWidth, tableStartY, brandColor, template)
  
  // Totals
  generateTotals(doc, invoice, margin, pageWidth, tableEndY, brandColor, template)
  
  // Notes
  if (invoice.notes && typeof invoice.notes === 'string' && invoice.notes.trim()) {
    let notesY = tableEndY + 50
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('NOTES', margin, notesY)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.setFontSize(10)
    const sanitizedNotes = sanitizeForPDF(invoice.notes).substring(0, 500)
    const noteLines = doc.splitTextToSize(sanitizedNotes, contentWidth)
    doc.text(noteLines.slice(0, 5), margin, notesY + 8)
  }
  
  // Footer
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
