'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiTrash2, FiDownload, FiSend, FiEye, FiSave, FiAlertCircle, FiUpload, FiX } from 'react-icons/fi'
import { Invoice, InvoiceItem, defaultInvoice, CURRENCIES } from '@/types/invoice'
import { saveInvoice, getInvoice } from '@/lib/storage'
import { downloadPDF } from '@/lib/pdf'
import { 
  sanitizeTextInput, 
  sanitizeEmail, 
  sanitizePhone, 
  sanitizeNumber, 
  isValidEmail, 
  isValidPhone,
  generateSecureId,
  generateInvoiceNumber
} from '@/lib/validation'
import toast from 'react-hot-toast'
import InvoicePreview from '@/components/InvoicePreview'

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
        setInvoice(existing)
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

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'fromEmail':
      case 'clientEmail':
        if (value && !isValidEmail(value)) {
          return 'Please enter a valid email address'
        }
        return ''
      case 'fromPhone':
        if (value && !isValidPhone(value)) {
          return 'Please enter a valid phone number'
        }
        return ''
      case 'clientName':
        if (!value.trim()) {
          return 'Client name is required'
        }
        if (value.length > 200) {
          return 'Client name is too long'
        }
        return ''
      case 'invoiceNumber':
        if (!value.trim()) {
          return 'Invoice number is required'
        }
        if (value.length > 50) {
          return 'Invoice number is too long'
        }
        return ''
      default:
        return ''
    }
  }

  const updateField = (field: keyof Invoice, value: string | number) => {
    if (!invoice) return
    
    let sanitizedValue: string | number = value
    
    if (typeof value === 'string') {
      if (field.includes('email')) {
        sanitizedValue = sanitizeEmail(value)
      } else if (field.includes('phone')) {
        sanitizedValue = sanitizePhone(value)
      } else if (field !== 'id' && field !== 'status') {
        sanitizedValue = sanitizeTextInput(value)
      }
    }
    
    const error = validateField(field, sanitizedValue as string)
    setErrors(prev => ({ ...prev, [field]: error }))
    
    setInvoice({ ...invoice, [field]: sanitizedValue })
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    if (!invoice) return
    
    let sanitizedValue: string | number = value
    
    if (typeof value === 'string') {
      if (field === 'description') {
        sanitizedValue = sanitizeTextInput(value)
      }
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
    
    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    })
  }

  const updateCurrency = (currencyCode: string) => {
    if (!invoice) return
    const currency = CURRENCIES.find(c => c.code === currencyCode)
    if (currency) {
      setInvoice({
        ...invoice,
        currency: currency.code,
        currencySymbol: currency.symbol,
      })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !invoice) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB')
      return
    }
    
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Logo removed')
  }

  const addItem = () => {
    if (!invoice) return
    
    if (invoice.items.length >= 100) {
      toast.error('Maximum 100 items allowed')
      return
    }
    
    const newItem: InvoiceItem = {
      id: generateSecureId(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setInvoice({ ...invoice, items: [...invoice.items, newItem] })
  }

  const removeItem = (itemId: string) => {
    if (!invoice || invoice.items.length <= 1) return
    
    const updatedItems = invoice.items.filter(item => item.id !== itemId)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (invoice.taxRate / 100)
    
    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    })
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    if (!invoice) return false
    
    if (!invoice.clientName.trim()) {
      newErrors.clientName = 'Client name is required'
    }
    
    if (!invoice.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required'
    }
    
    if (invoice.fromEmail && !isValidEmail(invoice.fromEmail)) {
      newErrors.fromEmail = 'Invalid email format'
    }
    
    if (invoice.clientEmail && !isValidEmail(invoice.clientEmail)) {
      newErrors.clientEmail = 'Invalid email format'
    }
    
    if (invoice.fromPhone && !isValidPhone(invoice.fromPhone)) {
      newErrors.fromPhone = 'Invalid phone format'
    }
    
    invoice.items.forEach((item, index) => {
      if (item.quantity < 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity cannot be negative'
      }
      if (item.rate < 0) {
        newErrors[`item_${index}_rate`] = 'Rate cannot be negative'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!invoice || isSaving) return
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }
    
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
    
    if (!validateForm()) {
      toast.error('Please fix the errors before downloading')
      return
    }
    
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
    
    if (!validateForm()) {
      toast.error('Please fix the errors before sending')
      return
    }
    
    saveInvoice(invoice)
    
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.fromName || 'Your Business'}`)
    const body = encodeURIComponent(
      `Hi ${invoice.clientName},\n\n` +
      `Please find attached invoice ${invoice.invoiceNumber} for ${invoice.currencySymbol || '$'}${invoice.total.toFixed(2)}.\n\n` +
      `Due date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n` +
      `Thank you for your business!\n\n` +
      `Best regards,\n${invoice.fromName}`
    )
    
    if (invoice.clientEmail) {
      window.location.href = `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`
    } else {
      toast.error('Please enter client email address')
    }
  }

  const getCurrencySymbol = () => {
    return invoice?.currencySymbol || '$'
  }

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center gap-2 lg:hidden"
            >
              <FiEye className="w-4 h-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button 
              onClick={handleSave} 
              className="btn-secondary flex items-center gap-2"
              disabled={isSaving}
            >
              <FiSave className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleDownload} 
              className="btn-primary flex items-center gap-2"
              disabled={isSaving}
            >
              <FiDownload className="w-4 h-4" />
              {isSaving ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Branding Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
          <div className="flex items-start gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <label className="label">Logo</label>
              <div className="relative">
                {invoice.logo ? (
                  <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={invoice.logo} 
                      alt="Logo" 
                      className="w-full h-full object-contain bg-gray-50"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
                  >
                    <FiUpload className="w-6 h-6 mb-2" />
                    <span className="text-xs">Upload Logo</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 2MB</p>
            </div>
            
            {/* Brand Color */}
            <div className="flex-1">
              <label className="label">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invoice.brandColor || '#3b82f6'}
                  onChange={(e) => updateField('brandColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={invoice.brandColor || '#3b82f6'}
                  onChange={(e) => updateField('brandColor', e.target.value)}
                  className="input-field flex-1"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Currency</h2>
          <select
            value={invoice.currency || 'USD'}
            onChange={(e) => updateCurrency(e.target.value)}
            className="input-field"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} - {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {/* From Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">From</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name / Business</label>
              <input
                type="text"
                className="input-field"
                value={invoice.fromName}
                onChange={(e) => updateField('fromName', e.target.value)}
                placeholder="John's Design Studio"
                maxLength={200}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className={`input-field ${errors.fromEmail ? 'border-red-500' : ''}`}
                value={invoice.fromEmail}
                onChange={(e) => updateField('fromEmail', e.target.value)}
                placeholder="john@example.com"
                maxLength={254}
              />
              {errors.fromEmail && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.fromEmail}
                </p>
              )}
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className={`input-field ${errors.fromPhone ? 'border-red-500' : ''}`}
                value={invoice.fromPhone}
                onChange={(e) => updateField('fromPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                maxLength={20}
              />
              {errors.fromPhone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.fromPhone}
                </p>
              )}
            </div>
            <div>
              <label className="label">Invoice Number</label>
              <input
                type="text"
                className={`input-field ${errors.invoiceNumber ? 'border-red-500' : ''}`}
                value={invoice.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                maxLength={50}
              />
              {errors.invoiceNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.invoiceNumber}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Address</label>
            <textarea
              className="input-field"
              rows={2}
              value={invoice.fromAddress}
              onChange={(e) => updateField('fromAddress', e.target.value)}
              placeholder="123 Main St, City, State 12345"
              maxLength={500}
            />
          </div>
        </div>

        {/* Client Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Client Name *</label>
              <input
                type="text"
                className={`input-field ${errors.clientName ? 'border-red-500' : ''}`}
                value={invoice.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                placeholder="Client Company"
                maxLength={200}
              />
              {errors.clientName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.clientName}
                </p>
              )}
            </div>
            <div>
              <label className="label">Client Email</label>
              <input
                type="email"
                className={`input-field ${errors.clientEmail ? 'border-red-500' : ''}`}
                value={invoice.clientEmail}
                onChange={(e) => updateField('clientEmail', e.target.value)}
                placeholder="client@example.com"
                maxLength={254}
              />
              {errors.clientEmail && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.clientEmail}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Client Address</label>
            <textarea
              className="input-field"
              rows={2}
              value={invoice.clientAddress}
              onChange={(e) => updateField('clientAddress', e.target.value)}
              placeholder="456 Client Ave, City, State 12345"
              maxLength={500}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="card">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Invoice Date</label>
              <input
                type="date"
                className="input-field"
                value={invoice.createdAt.split('T')[0]}
                onChange={(e) => updateField('createdAt', new Date(e.target.value).toISOString())}
              />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={invoice.dueDate.split('T')[0]}
                onChange={(e) => updateField('dueDate', new Date(e.target.value).toISOString())}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button onClick={addItem} className="btn-secondary flex items-center gap-2 text-sm">
              <FiPlus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {invoice.items.map((item, index) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 min-w-0">
                    <label className="label">Description</label>
                    <input
                      type="text"
                      className="input-field"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Service or product"
                      maxLength={500}
                    />
                  </div>
                  <div className="w-20 flex-shrink-0">
                    <label className="label">Qty</label>
                    <input
                      type="number"
                      className={`input-field ${errors[`item_${index}_quantity`] ? 'border-red-500' : ''}`}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="10000"
                    />
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <label className="label">Rate ({getCurrencySymbol()})</label>
                    <input
                      type="number"
                      className={`input-field ${errors[`item_${index}_rate`] ? 'border-red-500' : ''}`}
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="1000000"
                      step="0.01"
                    />
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <label className="label">Amount</label>
                    <div className="input-field bg-gray-100 font-medium text-right truncate">
                      {getCurrencySymbol()}{item.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                {invoice.items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tax & Notes */}
        <div className="card">
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
                  setInvoice({
                    ...invoice,
                    taxRate: rate,
                    taxAmount,
                    total: invoice.subtotal + taxAmount,
                  })
                }}
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div className="text-right min-w-[180px]">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subtotal</span>
                <span className="font-medium">{getCurrencySymbol()}{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium">{getCurrencySymbol()}{invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{getCurrencySymbol()}{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Notes</label>
            <textarea
              className="input-field"
              rows={3}
              value={invoice.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Payment terms, thank you note, etc."
              maxLength={1000}
            />
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          disabled={isSaving}
        >
          <FiSend className="w-5 h-5" />
          Send Invoice via Email
        </button>
      </div>

      {/* Preview (Desktop) */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <InvoicePreview invoice={invoice} />
        </div>
      </div>

      {/* Preview (Mobile Modal) */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden overflow-auto">
          <div className="min-h-full p-4">
            <div className="bg-white rounded-xl max-w-2xl mx-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
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
  )
}
