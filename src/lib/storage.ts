import { Invoice } from '@/types/invoice'

const STORAGE_KEY = 'invoicecraft_invoices'

export const getInvoices = (): Invoice[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices()
  const existingIndex = invoices.findIndex(i => i.id === invoice.id)
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice
  } else {
    invoices.unshift(invoice)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
}

export const getInvoice = (id: string): Invoice | undefined => {
  const invoices = getInvoices()
  return invoices.find(i => i.id === id)
}

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices()
  const filtered = invoices.filter(i => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export const updateInvoiceStatus = (id: string, status: Invoice['status']): void => {
  const invoice = getInvoice(id)
  if (invoice) {
    saveInvoice({ ...invoice, status })
  }
}
