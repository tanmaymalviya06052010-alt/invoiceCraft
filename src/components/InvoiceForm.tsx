'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiTrash2, FiDownload, FiSend, FiEye, FiSave, FiAlertCircle, FiUpload, FiX } from 'react-icons/fi'
import { Invoice, InvoiceItem, defaultInvoice, CURRENCIES, TEMPLATE_OPTIONS, ContactInfo, Address } from '@/types/invoice'
import { saveInvoice, getInvoice } from '@/lib/storage'
import { downloadPDF } from '@/lib/pdf'
import {
  sanitizeTextInput,
  sanitizeEmail,
  sanitizeNumber,
  isValidEmail,
  isValidPhone,
  generateSecureId,
  generateInvoiceNumber
} from '@/lib/validation'
import toast from 'react-hot-toast'
import InvoicePreview from '@/components/InvoicePreview'
import ContactForm from '@/components/ContactForm'
import Logo from '@/components/Logo'
import Link from 'next/link'

interface InvoiceFormProps {
  id?: string
}

interface ValidationErrors {
  [key: string]: string
}

export default function InvoiceForm({ id }: InvoiceFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      const existing = getInvoice(id)
      if (existing) {
        const migrated = migrateInvoice(existing)
        setInvoice(migrated)
      } else {
        toast.error('Invoice not found')
        router.push('/dashboard')
      }
    } else {
      setInvoice({
        ...defaultInvoice,
        id: generateSecureId(),
        invoiceNumber: generateInvoiceNumber(),
      } as Invoice)
    }
    setIsLoading(false)
  }, [id, router])

  const migrateInvoice = (inv: any): Invoice => {
    if (inv.from && typeof inv.from === 'object' && inv.from.name !== undefined) {
      return inv
    }
    return {
      ...inv,
      from: {
        name: inv.fromName || '',
        email: inv.fromEmail || '',
        phone: inv.fromPhone || '',
        phoneCode: '+1',
        address: { street: inv.fromAddress || '', city: '', state: '', zip: '', country: '', countryCode: '' },
        taxId: '',
      },
      client: {
        name: inv.clientName || '',
        email: inv.clientEmail || '',
        phone: '',
        phoneCode: '+1',
        address: { street: inv.clientAddress || '', city: '', state: '', zip: '', country: '', countryCode: '' },
        taxId: '',
      },
      terms: inv.terms || 'Payment is due within 30 days of invoice date.',
      paymentTerms: inv.paymentTerms || 'Net 30',
    }
  }

  const updateField = (field: keyof Invoice, value: any) => {
    if (!invoice) return
    setInvoice({ ...invoice, [field]: value })
  }

  const updateFrom = (from: ContactInfo) => {
    if (!invoice) return
    setInvoice({ ...invoice, from })
  }

  const updateClient = (client: ContactInfo) => {
    if (!invoice) return
    setInvoice({ ...invoice, client })
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    if (!invoice) return
    let sanitizedValue: string | number = value
    if (typeof value === 'string' && field === 'description') {
      sanitizedValue = sanitizeTextInput(value)
    } else if (typeof value === 'number') {
      sanitizedValue = sanitizeNumber(value, 0, field === 'quantity' ? 10000 : 1000000)
    }
    const updatedItems = invoice.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: sanitizedValue }
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate
        }
        return updated
      }
      return item
    })
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (invoice.taxRate / 100)
    setInvoice({ ...invoice, items: updatedItems, subtotal, taxAmount, total: subtotal + taxAmount })
  }

  const updateCurrency = (currencyCode: string) => {
    if (!invoice) return
    const currency = CURRENCIES.find(c => c.code === currencyCode)
    if (currency) {
      setInvoice({ ...invoice, currency: currency.code, currencySymbol: currency.symbol })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !invoice) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be less than 2MB'); return }
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setInvoice({ ...invoice, logo: base64 })
      toast.success('Logo uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    if (!invoice) return
    setInvoice({ ...invoice, logo: undefined })
    if (fileInputRef.current) { fileInputRef.current.value = '' }
    toast.success('Logo removed')
  }

  const addItem = () => {
    if (!invoice) return
    if (invoice.items.length >= 100) { toast.error('Maximum 100 items allowed'); return }
    const newItem: InvoiceItem = { id: generateSecureId(), description: '', quantity: 1, rate: 0, amount: 0 }
    setInvoice({ ...invoice, items: [...invoice.items, newItem] })
  }

  const removeItem = (itemId: string) => {
    if (!invoice || invoice.items.length <= 1) return
    const updatedItems = invoice.items.filter(item => item.id !== itemId)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (invoice.taxRate / 100)
    setInvoice({ ...invoice, items: updatedItems, subtotal, taxAmount, total: subtotal + taxAmount })
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    if (!invoice) return false
    if (!invoice.client.name.trim()) { newErrors.clientName = 'Client name is required' }
    if (!invoice.invoiceNumber.trim()) { newErrors.invoiceNumber = 'Invoice number is required' }
    if (invoice.from.email && !isValidEmail(invoice.from.email)) { newErrors.fromEmail = 'Invalid email format' }
    if (invoice.client.email && !isValidEmail(invoice.client.email)) { newErrors.clientEmail = 'Invalid email format' }
    if (invoice.from.phone && !isValidPhone(invoice.from.phone)) { newErrors.fromPhone = 'Invalid phone format' }
    if (invoice.client.phone && !isValidPhone(invoice.client.phone)) { newErrors.clientPhone = 'Invalid phone format' }
    invoice.items.forEach((item, index) => {
      if (item.quantity < 0) { newErrors[`item_${index}_quantity`] = 'Quantity cannot be negative' }
      if (item.rate < 0) { newErrors[`item_${index}_rate`] = 'Rate cannot be negative' }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!invoice || isSaving) return
    if (!validateForm()) { toast.error('Please fix the errors before saving'); return }
    setIsSaving(true)
    try {
      saveInvoice(invoice)
      toast.success('Invoice saved!')
    } catch (error) {
      toast.error('Failed to save invoice')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!invoice || isSaving) return
    if (!validateForm()) { toast.error('Please fix the errors before downloading'); return }
    setIsSaving(true)
    try {
      saveInvoice(invoice)
      downloadPDF(invoice)
      toast.success('PDF downloaded!')
    } catch (error) {
      toast.error('Failed to generate PDF')
      console.error('PDF error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = () => {
    if (!invoice || isSaving) return
    if (!validateForm()) { toast.error('Please fix the errors before sending'); return }
    saveInvoice(invoice)
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.from.name || 'Your Business'}`)
    const body = encodeURIComponent(
      `Hi ${invoice.client.name},\n\n` +
      `Please find attached invoice ${invoice.invoiceNumber} for ${invoice.currencySymbol || '$'}${invoice.total.toFixed(2)}.\n\n` +
      `Due date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n` +
      `Thank you for your business!\n\n` +
      `Best regards,\n${invoice.from.name}`
    )
    if (invoice.client.email) {
      window.location.href = `mailto:${invoice.client.email}?subject=${subject}&body=${body}`
    } else {
      toast.error('Please enter client email address')
    }
  }

  const getCurrencySymbol = () => invoice?.currencySymbol || '$'

  if (isLoading || !invoice) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-surface-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-ghost flex items-center gap-2 lg:hidden text-sm"
              >
                <FiEye className="w-4 h-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button onClick={handleSave} className="btn-secondary flex items-center gap-2 text-sm py-2.5" disabled={isSaving}>
                <FiSave className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleDownload} className="btn-primary flex items-center gap-2 text-sm py-2.5" disabled={isSaving}>
                <FiDownload className="w-4 h-4" />
                {isSaving ? 'Generating...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10 animate-in">
          <h1 className="text-display-xl text-surface-900 mb-2">
            {id ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-surface-500 text-lg font-light">Fill in the details to create your invoice.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Branding */}
            <div className="card-elevated animate-in delay-100">
              <h2 className="text-display-sm text-surface-900 mb-5">Branding</h2>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <label className="label">Logo</label>
                  <div className="relative">
                    {invoice.logo ? (
                      <div className="relative w-28 h-28 border-2 border-surface-100 rounded-2xl overflow-hidden bg-surface-50">
                        <img src={invoice.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        <button
                          onClick={removeLogo}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-surface-900/80 text-white rounded-full hover:bg-surface-900 transition-colors backdrop-blur-sm"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 border-2 border-dashed border-surface-200 rounded-2xl flex flex-col items-center justify-center text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-all duration-200 bg-surface-50/50"
                      >
                        <FiUpload className="w-5 h-5 mb-2" />
                        <span className="text-xs font-medium">Upload</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                  <p className="text-xs text-surface-400 mt-2">Max 2MB</p>
                </div>

                <div className="flex-1">
                  <label className="label">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={invoice.brandColor || '#7c3aed'}
                      onChange={(e) => updateField('brandColor', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={invoice.brandColor || '#7c3aed'}
                      onChange={(e) => updateField('brandColor', e.target.value)}
                      className="input-field flex-1 font-mono text-sm"
                      placeholder="#7c3aed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card-elevated animate-in delay-200">
              <h2 className="text-display-sm text-surface-900 mb-5">Settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Currency</label>
                  <select value={invoice.currency || 'USD'} onChange={(e) => updateCurrency(e.target.value)} className="input-field">
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.symbol} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Template</label>
                  <select value={invoice.template || 'professional'} onChange={(e) => updateField('template', e.target.value)} className="input-field">
                    {TEMPLATE_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* From */}
            <div className="animate-in delay-300">
              <ContactForm value={invoice.from} onChange={updateFrom} label="From (Your Business)" showTaxId />
            </div>

            {/* Client */}
            <div className="animate-in delay-400">
              <ContactForm value={invoice.client} onChange={updateClient} label="Bill To (Client)" showTaxId />
            </div>

            {/* Dates */}
            <div className="card-elevated animate-in delay-500">
              <h2 className="text-display-sm text-surface-900 mb-5">Invoice Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Invoice Date</label>
                  <input type="date" className="input-field" value={invoice.createdAt.split('T')[0]} onChange={(e) => updateField('createdAt', new Date(e.target.value).toISOString())} />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input type="date" className="input-field" value={invoice.dueDate.split('T')[0]} onChange={(e) => updateField('dueDate', new Date(e.target.value).toISOString())} />
                </div>
                <div>
                  <label className="label">Invoice Number</label>
                  <input
                    type="text"
                    className={`input-field font-mono ${errors.invoiceNumber ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                    maxLength={50}
                  />
                  {errors.invoiceNumber && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {errors.invoiceNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">PO Number</label>
                  <input type="text" className="input-field font-mono" value={invoice.poNumber || ''} onChange={(e) => updateField('poNumber', e.target.value)} placeholder="Optional" maxLength={50} />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card-elevated animate-in delay-600">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-display-sm text-surface-900">Items</h2>
                <button onClick={addItem} className="btn-ghost flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                  <FiPlus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 min-w-0">
                        <label className="label text-xs">Description</label>
                        <input type="text" className="input-field" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Service or product" maxLength={500} />
                      </div>
                      <div className="w-20 flex-shrink-0">
                        <label className="label text-xs">Qty</label>
                        <input
                          type="number"
                          className={`input-field text-center ${errors[`item_${index}_quantity`] ? 'border-red-400' : ''}`}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0" max="10000"
                        />
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <label className="label text-xs">Rate ({getCurrencySymbol()})</label>
                        <input
                          type="number"
                          className={`input-field text-right ${errors[`item_${index}_rate`] ? 'border-red-400' : ''}`}
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          min="0" max="1000000" step="0.01"
                        />
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <label className="label text-xs">Amount</label>
                        <div className="input-field bg-surface-100/50 font-display font-semibold text-right text-surface-900">
                          {getCurrencySymbol()}{item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {invoice.items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="mt-2 text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-medium">
                        <FiTrash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tax & Totals */}
            <div className="card-elevated animate-in delay-700">
              <div className="flex justify-between items-start gap-8">
                <div className="flex-1">
                  <label className="label">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="input-field max-w-[120px]"
                    value={invoice.taxRate}
                    onChange={(e) => {
                      const rate = sanitizeNumber(parseFloat(e.target.value) || 0, 0, 100)
                      const taxAmount = invoice.subtotal * (rate / 100)
                      setInvoice({ ...invoice, taxRate: rate, taxAmount, total: invoice.subtotal + taxAmount })
                    }}
                    min="0" max="100" step="0.5"
                  />
                </div>
                <div className="text-right min-w-[200px]">
                  <div className="flex justify-between text-sm text-surface-500 mb-2">
                    <span>Subtotal</span>
                    <span className="font-medium text-surface-700">{getCurrencySymbol()}{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between text-sm text-surface-500 mb-2">
                      <span>Tax ({invoice.taxRate}%)</span>
                      <span className="font-medium text-surface-700">{getCurrencySymbol()}{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-surface-200 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-semibold text-surface-900">Total</span>
                      <span className="text-2xl font-display font-bold gradient-text">{getCurrencySymbol()}{invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card-elevated animate-in delay-700">
              <h2 className="text-display-sm text-surface-900 mb-5">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Notes</label>
                  <textarea className="input-field" rows={2} value={invoice.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Thank you for your business!" maxLength={500} />
                </div>
                <div>
                  <label className="label">Terms & Conditions</label>
                  <textarea className="input-field" rows={3} value={invoice.terms} onChange={(e) => updateField('terms', e.target.value)} placeholder="Payment terms, late fees, etc." maxLength={1000} />
                </div>
              </div>
            </div>

            {/* Send Button */}
            <button onClick={handleSend} className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base animate-in delay-700" disabled={isSaving}>
              <FiSend className="w-5 h-5" />
              Send Invoice via Email
            </button>
          </div>

          {/* Preview (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-display-sm text-surface-900 mb-4">Preview</h2>
              <InvoicePreview invoice={invoice} />
            </div>
          </div>

          {/* Preview (Mobile Modal) */}
          {showPreview && (
            <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-50 lg:hidden overflow-auto">
              <div className="min-h-full p-4">
                <div className="bg-white rounded-3xl max-w-2xl mx-auto overflow-hidden shadow-elevated-xl">
                  <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b border-surface-100 flex justify-between items-center z-10">
                    <h2 className="font-display font-semibold text-surface-900">Preview</h2>
                    <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                      <FiX className="w-5 h-5 text-surface-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <InvoicePreview invoice={invoice} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
