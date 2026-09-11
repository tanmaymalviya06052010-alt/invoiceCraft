'use client'

import { Invoice } from '@/types/invoice'
import { format } from 'date-fns'

interface InvoicePreviewProps {
  invoice: Invoice
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const brandColor = invoice.brandColor || '#3b82f6'
  const currencySymbol = invoice.currencySymbol || '$'
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 text-white"
        style={{ backgroundColor: brandColor }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {invoice.logo && (
              <img 
                src={invoice.logo} 
                alt="Logo" 
                className="h-12 w-auto object-contain bg-white/10 rounded p-1"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-white/80 mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-sm">Status</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              invoice.status === 'paid' ? 'bg-green-500' :
              invoice.status === 'sent' ? 'bg-yellow-500' :
              invoice.status === 'overdue' ? 'bg-red-500' :
              'bg-white/20'
            }`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* From & To */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From</h3>
            <div className="text-sm">
              {invoice.fromName && <p className="font-medium text-gray-900">{invoice.fromName}</p>}
              {invoice.fromEmail && <p className="text-gray-600">{invoice.fromEmail}</p>}
              {invoice.fromPhone && <p className="text-gray-600">{invoice.fromPhone}</p>}
              {invoice.fromAddress && (
                <p className="text-gray-600 whitespace-pre-line mt-1">{invoice.fromAddress}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
            <div className="text-sm">
              {invoice.clientName && <p className="font-medium text-gray-900">{invoice.clientName}</p>}
              {invoice.clientEmail && <p className="text-gray-600">{invoice.clientEmail}</p>}
              {invoice.clientAddress && (
                <p className="text-gray-600 whitespace-pre-line mt-1">{invoice.clientAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-gray-500">Invoice Date: </span>
            <span className="font-medium">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div>
            <span className="text-gray-500">Due Date: </span>
            <span className="font-medium">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Description</th>
                <th className="text-center py-3 font-semibold text-gray-700 w-20">Qty</th>
                <th className="text-right py-3 font-semibold text-gray-700 w-24">Rate</th>
                <th className="text-right py-3 font-semibold text-gray-700 w-24">Amount</th>
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
          <div className="w-64 space-y-2">
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

        {/* Notes */}
        {invoice.notes && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          Created with InvoiceCraft
        </div>
      </div>
    </div>
  )
}
