'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2, FiDownload, FiEdit2 } from 'react-icons/fi'
import { Invoice } from '@/types/invoice'
import { getInvoices, deleteInvoice, updateInvoiceStatus } from '@/lib/storage'
import { downloadPDF } from '@/lib/pdf'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setInvoices(getInvoices())
    setIsLoading(false)
  }, [])

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter)

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    pendingRevenue: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id)
      setInvoices(getInvoices())
      toast.success('Invoice deleted')
    }
  }

  const handleStatusChange = (id: string, status: Invoice['status']) => {
    updateInvoiceStatus(id, status)
    setInvoices(getInvoices())
    toast.success(`Invoice marked as ${status}`)
  }

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return <FiFileText className="w-4 h-4" />
      case 'sent':
        return <FiClock className="w-4 h-4" />
      case 'paid':
        return <FiCheckCircle className="w-4 h-4" />
      case 'overdue':
        return <FiAlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'sent':
        return 'bg-yellow-100 text-yellow-700'
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'overdue':
        return 'bg-red-100 text-red-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">InvoiceCraft</span>
            </a>
            <Link href="/invoice/new" className="btn-primary flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Paid</div>
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">${stats.pendingRevenue.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {invoices.filter(i => i.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="card text-center py-12">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
            <Link href="/invoice/new" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="text-lg font-medium text-gray-900">{invoice.client?.name || 'Unnamed Client'}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(invoice.createdAt), 'MMM d, yyyy')} • Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">${invoice.total.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/invoice/${invoice.id}`}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => downloadPDF(invoice)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
