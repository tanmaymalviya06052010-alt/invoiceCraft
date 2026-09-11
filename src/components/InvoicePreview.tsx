'use client'

import { Invoice, InvoiceTemplate } from '@/types/invoice'
import { format } from 'date-fns'

interface InvoicePreviewProps {
  invoice: Invoice
}

// ========== HELPER: Format address ==========
function formatAddress(address: any): string {
  if (!address) return ''
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean)
  if (address.country) parts.push(address.country)
  return parts.join(', ')
}

// ========== STATUS BADGE ==========
function StatusBadge({ status, variant = 'filled' }: { status: string; variant?: string }) {
  const colors: Record<string, string> = {
    paid: 'bg-green-500 text-white',
    sent: 'bg-yellow-500 text-white',
    overdue: 'bg-red-500 text-white',
    draft: 'bg-gray-200 text-gray-700',
  }
  
  const outlinedColors: Record<string, string> = {
    paid: 'border-green-500 text-green-600',
    sent: 'border-yellow-500 text-yellow-600',
    overdue: 'border-red-500 text-red-600',
    draft: 'border-gray-300 text-gray-600',
  }
  
  if (variant === 'outlined') {
    return (
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border-2 ${outlinedColors[status] || outlinedColors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }
  
  if (variant === 'minimal') {
    return (
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {status}
      </div>
    )
  }
  
  if (variant === 'creative') {
    return (
      <div className="inline-block px-4 py-1.5 rounded-lg text-xs font-bold bg-white/20 text-white uppercase tracking-wider">
        {status}
      </div>
    )
  }
  
  return (
    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

// ========== SHARED INVOICE BODY ==========
function InvoiceBody({ invoice, currencySymbol, brandColor, minimal = false }: { invoice: Invoice; currencySymbol: string; brandColor: string; minimal?: boolean }) {
  const from = invoice.from || {}
  const client = invoice.client || {}
  
  return (
    <div className="p-6 space-y-6">
      {/* From & To */}
      <div className={`grid sm:grid-cols-2 gap-6 ${minimal ? 'border-b border-gray-100 pb-6' : ''}`}>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From</h3>
          <div className="text-sm">
            {from.name && <p className={`font-medium text-gray-900 ${minimal ? 'text-base' : ''}`}>{from.name}</p>}
            {from.email && <p className="text-gray-600">{from.email}</p>}
            {from.phone && <p className="text-gray-600">{from.phoneCode} {from.phone}</p>}
            {from.address && formatAddress(from.address) && (
              <p className="text-gray-600 whitespace-pre-line mt-1">{formatAddress(from.address)}</p>
            )}
            {from.taxId && <p className="text-gray-500 mt-1">Tax ID: {from.taxId}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
          <div className="text-sm">
            {client.name && <p className={`font-medium text-gray-900 ${minimal ? 'text-base' : ''}`}>{client.name}</p>}
            {client.email && <p className="text-gray-600">{client.email}</p>}
            {client.phone && <p className="text-gray-600">{client.phoneCode} {client.phone}</p>}
            {client.address && formatAddress(client.address) && (
              <p className="text-gray-600 whitespace-pre-line mt-1">{formatAddress(client.address)}</p>
            )}
            {client.taxId && <p className="text-gray-500 mt-1">Tax ID: {client.taxId}</p>}
          </div>
        </div>
      </div>

      {/* PO Number */}
      {invoice.poNumber && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">PO Number:</span> {invoice.poNumber}
        </div>
      )}

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={minimal ? 'border-b border-gray-300' : 'bg-gray-50'}>
              <th className={`text-left py-3 font-semibold text-gray-700 ${minimal ? 'font-medium' : ''}`}>Description</th>
              <th className={`text-center py-3 font-semibold text-gray-700 w-20 ${minimal ? 'font-medium' : ''}`}>Qty</th>
              <th className={`text-right py-3 font-semibold text-gray-700 w-24 ${minimal ? 'font-medium' : ''}`}>Rate</th>
              <th className={`text-right py-3 font-semibold text-gray-700 w-24 ${minimal ? 'font-medium' : ''}`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-900">{item.description || '-'}</td>
                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600">{currencySymbol}{item.rate.toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-gray-900">{currencySymbol}{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className={`w-64 space-y-2 ${minimal ? '' : 'bg-gray-50 p-4 rounded-lg'}`}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
              <span className="font-medium">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold" style={{ color: brandColor }}>
              {currencySymbol}{invoice.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="space-y-4">
        {invoice.notes && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Terms & Conditions</h3>
            <p className="text-xs text-gray-500 whitespace-pre-line">{invoice.terms}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        Created with InvoiceCraft
      </div>
    </div>
  )
}

// ========== PROFESSIONAL TEMPLATE ==========
function ProfessionalTemplate({ invoice, currencySymbol, brandColor }: { invoice: Invoice; currencySymbol: string; brandColor: string }) {
  return (
    <>
      <div className="p-6 text-white" style={{ backgroundColor: brandColor }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-12 w-auto object-contain bg-white/10 rounded p-1" />
            )}
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-white/80 mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={invoice.status} />
            <div className="mt-2 text-sm text-white/70">
              <div>Date: {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</div>
              <div>Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</div>
            </div>
          </div>
        </div>
      </div>
      <InvoiceBody invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
    </>
  )
}

// ========== MODERN TEMPLATE ==========
function ModernTemplate({ invoice, currencySymbol, brandColor }: { invoice: Invoice; currencySymbol: string; brandColor: string }) {
  return (
    <>
      <div className="flex">
        <div className="w-2" style={{ backgroundColor: brandColor }}></div>
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {invoice.logo && (
                <img src={invoice.logo} alt="Logo" className="h-14 w-auto object-contain" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-500 mt-1">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={invoice.status} variant="outlined" />
              <div className="mt-2 text-sm text-gray-500">
                <div>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InvoiceBody invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
    </>
  )
}

// ========== MINIMAL TEMPLATE ==========
function MinimalTemplate({ invoice, currencySymbol, brandColor }: { invoice: Invoice; currencySymbol: string; brandColor: string }) {
  return (
    <>
      <div className="p-8 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-10 w-auto object-contain mb-4" />
            )}
            <h1 className="text-4xl font-light text-gray-900 tracking-tight">INVOICE</h1>
            <p className="text-gray-400 mt-2 text-sm">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={invoice.status} variant="minimal" />
            <div className="mt-4 space-y-1 text-sm text-gray-500">
              <div><span className="text-gray-400">Date:</span> {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</div>
              <div><span className="text-gray-400">Due:</span> {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</div>
            </div>
          </div>
        </div>
      </div>
      <InvoiceBody invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} minimal />
    </>
  )
}

// ========== CREATIVE TEMPLATE ==========
function CreativeTemplate({ invoice, currencySymbol, brandColor }: { invoice: Invoice; currencySymbol: string; brandColor: string }) {
  return (
    <>
      <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)` }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {invoice.logo && (
              <div className="bg-white/20 rounded-xl p-2">
                <img src={invoice.logo} alt="Logo" className="h-10 w-auto object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-wide">INVOICE</h1>
              <p className="text-white/70 text-sm mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={invoice.status} variant="creative" />
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 flex justify-between text-sm text-gray-600">
        <span>Issued: {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
        <span>Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
      </div>
      <InvoiceBody invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
    </>
  )
}

// ========== MAIN COMPONENT ==========
export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const brandColor = invoice.brandColor || '#3b82f6'
  const currencySymbol = invoice.currencySymbol || '$'
  const template = invoice.template || 'professional'
  
  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
      case 'minimal':
        return <MinimalTemplate invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
      case 'creative':
        return <CreativeTemplate invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
      default:
        return <ProfessionalTemplate invoice={invoice} currencySymbol={currencySymbol} brandColor={brandColor} />
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {renderTemplate()}
    </div>
  )
}
