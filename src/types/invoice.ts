export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate: string
  
  // From
  fromName: string
  fromEmail: string
  fromAddress: string
  fromPhone: string
  
  // Client
  clientName: string
  clientEmail: string
  clientAddress: string
  
  // Items
  items: InvoiceItem[]
  
  // Totals
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  
  // Notes
  notes: string
  
  // Branding
  logo?: string
  brandColor?: string
}

export type InvoiceTemplate = 'professional' | 'modern' | 'minimal' | 'creative'

// Default invoice with placeholder values - actual IDs are generated at runtime
export const defaultInvoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
  status: 'draft',
  createdAt: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  
  fromName: '',
  fromEmail: '',
  fromAddress: '',
  fromPhone: '',
  
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  
  items: [
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ],
  
  subtotal: 0,
  taxRate: 0,
  taxAmount: 0,
  total: 0,
  
  notes: 'Thank you for your business!',
  
  brandColor: '#3b82f6',
}
