'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2, FiDownload, FiEdit2, FiArrowUpRight } from 'react-icons/fi'
import { Invoice } from '@/types/invoice'
import { getInvoices, deleteInvoice, updateInvoiceStatus } from '@/lib/storage'
import { downloadPDF } from '@/lib/pdf'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'

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

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return { icon: FiFileText, color: 'bg-surface-100 text-surface-600', dot: 'bg-surface-400' }
      case 'sent':
        return { icon: FiClock, color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' }
      case 'paid':
        return { icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' }
      case 'overdue':
        return { icon: FiAlertCircle, color: 'bg-red-50 text-red-600', dot: 'bg-red-400' }
    }
  }

  if (isLoading) {
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
            <Link href="/invoice/new" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
              <FiPlus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10 animate-in">
          <h1 className="text-display-xl text-surface-900 mb-2">Dashboard</h1>
          <p className="text-surface-500 text-lg font-light">Manage your invoices and track payments.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
          <div className="card-elevated group hover-lift">
            <div className="text-sm text-surface-400 font-medium mb-1">Total Invoices</div>
            <div className="text-3xl font-display font-bold text-surface-900">{stats.total}</div>
          </div>
          <div className="card-elevated group hover-lift">
            <div className="text-sm text-surface-400 font-medium mb-1">Paid</div>
            <div className="text-3xl font-display font-bold text-emerald-600">
              ${stats.totalRevenue.toFixed(0)}
            </div>
          </div>
          <div className="card-elevated group hover-lift">
            <div className="text-sm text-surface-400 font-medium mb-1">Pending</div>
            <div className="text-3xl font-display font-bold text-amber-500">
              ${stats.pendingRevenue.toFixed(0)}
            </div>
          </div>
          <div className="card-elevated group hover-lift">
            <div className="text-sm text-surface-400 font-medium mb-1">Overdue</div>
            <div className="text-3xl font-display font-bold text-red-500">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-in delay-200">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-2xl font-display font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                filter === status
                  ? 'bg-surface-900 text-white shadow-elevated'
                  : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === status ? 'bg-white/20' : 'bg-surface-100'
                }`}>
                  {invoices.filter(i => i.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="card-elevated text-center py-20 animate-in delay-300">
            <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mx-auto mb-6">
              <FiFileText className="w-10 h-10 text-surface-300" />
            </div>
            <h3 className="text-display-md text-surface-900 mb-2">No invoices yet</h3>
            <p className="text-surface-500 mb-8 max-w-sm mx-auto">
              Create your first invoice and it will appear here.
            </p>
            <Link href="/invoice/new" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filteredInvoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status)
              const StatusIcon = statusConfig.icon
              return (
                <div key={invoice.id} className="card-elevated hover-lift group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                        <span className="text-sm text-surface-400 font-mono">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="text-lg font-display font-semibold text-surface-900 mb-1">
                        {invoice.client?.name || 'Unnamed Client'}
                      </div>
                      <div className="text-sm text-surface-500">
                        {format(new Date(invoice.createdAt), 'MMM d, yyyy')} → Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-display font-bold text-surface-900">
                          ${invoice.total.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          href={`/invoice/${invoice.id}`}
                          className="p-2.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => downloadPDF(invoice)}
                          className="p-2.5 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Download PDF"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
