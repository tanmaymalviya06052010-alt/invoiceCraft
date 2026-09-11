import jsPDF from 'jspdf'
import { Invoice, InvoiceTemplate } from '@/types/invoice'
import { format } from 'date-fns'
import { sanitizeString } from './validation'

const sanitizeForPDF = (text: string | undefined | null): string => {
  if (!text || typeof text !== 'string') return ''
  return sanitizeString(text).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').substring(0, 500) || ''
}

const validateInvoice = (invoice: Invoice): boolean => {
  return !!(invoice && typeof invoice.invoiceNumber === 'string' && typeof invoice.total === 'number' && !isNaN(invoice.total) && invoice.total >= 0)
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [59, 130, 246]
}

const formatAddress = (address: any): string => {
  if (!address) return ''
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean)
  if (address.country) parts.push(address.country)
  return parts.join(', ')
}

export const generatePDF = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  if (!validateInvoice(invoice)) throw new Error('Invalid invoice data')
  
  const brandColor = hexToRgb(invoice.brandColor || '#3b82f6')
  const darkColor: [number, number, number] = [30, 41, 59]
  const grayColor: [number, number, number] = [100, 116, 139]
  const template = invoice.template || 'professional'
  const currencySymbol = invoice.currencySymbol || '$'
  const from = invoice.from || {} as any
  const client = invoice.client || {} as any
  
  // ========== HEADER ==========
  const headerHeight = 45
  if (template === 'minimal') {
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, 45, pageWidth - margin, 45)
  } else if (template === 'modern') {
    doc.setFillColor(...brandColor)
    doc.rect(0, 0, 6, headerHeight, 'F')
  } else {
    doc.setFillColor(...brandColor)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
  }
  
  let titleX = margin
  if (invoice.logo) {
    try {
      doc.addImage(invoice.logo, 'PNG', margin, 10, 35, 22)
      titleX = margin + 40
    } catch {}
  }
  
  const titleY = template === 'minimal' ? 35 : 28
  doc.setTextColor(template === 'minimal' ? 30 : 255, template === 'minimal' ? 41 : 255, template === 'minimal' ? 59 : 255)
  doc.setFontSize(template === 'minimal' ? 32 : 28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', titleX, titleY)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(template === 'minimal' ? 100 : 255, template === 'minimal' ? 116 : 255, template === 'minimal' ? 139 : 255)
  doc.text(sanitizeForPDF(invoice.invoiceNumber), pageWidth - margin, titleY, { align: 'right' })
  
  // ========== FROM / BILL TO / DATES ==========
  let y = 58
  const midCol = 80
  const rightCol = 140
  
  // FROM
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('FROM', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  y = 66
  if (from.name) { doc.setTextColor(...darkColor); doc.setFont('helvetica', 'bold'); doc.text(sanitizeForPDF(from.name), margin, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...grayColor); y += 5 }
  if (from.email) { doc.text(sanitizeForPDF(from.email), margin, y); y += 5 }
  if (from.phone) { doc.text(`${from.phoneCode || ''} ${from.phone || ''}`.trim(), margin, y); y += 5 }
  const fromAddr = formatAddress(from.address)
  if (fromAddr) { const lines = doc.splitTextToSize(sanitizeForPDF(fromAddr), 55); doc.text(lines, margin, y) }
  
  // BILL TO
  y = 58
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', midCol, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  y = 66
  if (client.name) { doc.setTextColor(...darkColor); doc.setFont('helvetica', 'bold'); doc.text(sanitizeForPDF(client.name), midCol, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...grayColor); y += 5 }
  if (client.email) { doc.text(sanitizeForPDF(client.email), midCol, y); y += 5 }
  if (client.phone) { doc.text(`${client.phoneCode || ''} ${client.phone || ''}`.trim(), midCol, y); y += 5 }
  const clientAddr = formatAddress(client.address)
  if (clientAddr) { const lines = doc.splitTextToSize(sanitizeForPDF(clientAddr), 55); doc.text(lines, midCol, y) }
  
  // DATES
  y = 58
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE DATE', rightCol, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  y = 66
  try { const d = new Date(invoice.createdAt); if (!isNaN(d.getTime())) doc.text(format(d, 'MMM d, yyyy'), rightCol, y) } catch { doc.text('-', rightCol, y) }
  y += 12
  doc.setTextColor(...darkColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DUE DATE', rightCol, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  y += 8
  try { const d = new Date(invoice.dueDate); if (!isNaN(d.getTime())) doc.text(format(d, 'MMM d, yyyy'), rightCol, y) } catch { doc.text('-', rightCol, y) }
  
  // PO Number
  if (invoice.poNumber) {
    y += 12
    doc.setTextColor(...darkColor)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('PO NUMBER', rightCol, y - 8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.setFontSize(10)
    doc.text(sanitizeForPDF(invoice.poNumber), rightCol, y)
  }
  
  // ========== ITEMS TABLE ==========
  y = 105
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y, contentWidth, 8, 'F')
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DESCRIPTION', margin + 2, y + 5.5)
  doc.text('QTY', margin + 115, y + 5.5)
  doc.text('RATE', margin + 135, y + 5.5)
  doc.text('AMOUNT', pageWidth - margin - 2, y + 5.5, { align: 'right' })
  
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  for (let i = 0; i < Math.min(invoice.items.length, 50); i++) {
    const item = invoice.items[i]
    if (!item) continue
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(margin, y - 3, contentWidth, 8, 'F') }
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, y + 5, pageWidth - margin, y + 5)
    doc.setTextColor(...grayColor)
    const desc = sanitizeForPDF(item.description) || '-'
    doc.text(doc.splitTextToSize(desc, 90)[0] || '-', margin + 2, y + 3)
    doc.text((item.quantity || 0).toString(), margin + 118, y + 3)
    doc.text(`${currencySymbol}${(item.rate || 0).toFixed(2)}`, margin + 135, y + 3)
    doc.text(`${currencySymbol}${(item.amount || 0).toFixed(2)}`, pageWidth - margin - 2, y + 3, { align: 'right' })
    y += 8
  }
  
  // ========== TOTALS ==========
  y += 8
  doc.setDrawColor(226, 232, 240)
  doc.line(pageWidth - margin - 65, y, pageWidth - margin, y)
  y += 8
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal', pageWidth - margin - 65, y)
  doc.text(`${currencySymbol}${(invoice.subtotal || 0).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' })
  if (invoice.taxRate > 0) {
    y += 8
    doc.text(`Tax (${invoice.taxRate}%)`, pageWidth - margin - 65, y)
    doc.text(`${currencySymbol}${(invoice.taxAmount || 0).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' })
  }
  y += 10
  doc.setFillColor(...brandColor)
  doc.roundedRect(pageWidth - margin - 68, y - 5, 70, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL', pageWidth - margin - 63, y + 3)
  doc.text(`${currencySymbol}${(invoice.total || 0).toFixed(2)}`, pageWidth - margin - 5, y + 3, { align: 'right' })
  
  // ========== NOTES & TERMS ==========
  y += 25
  if (invoice.notes) {
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('NOTES', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(sanitizeForPDF(invoice.notes).substring(0, 500), contentWidth)
    doc.text(lines.slice(0, 3), margin, y + 8)
    y += 8 + lines.slice(0, 3).length * 4
  }
  if (invoice.terms) {
    y += 5
    doc.setTextColor(...darkColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('TERMS & CONDITIONS', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(sanitizeForPDF(invoice.terms).substring(0, 500), contentWidth)
    doc.text(lines.slice(0, 4), margin, y + 6)
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
