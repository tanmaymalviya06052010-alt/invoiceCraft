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
  
  // Currency
  currency?: string
  currencySymbol?: string
  
  // Template
  template?: 'professional' | 'modern' | 'minimal' | 'creative'
}

export type InvoiceTemplate = 'professional' | 'modern' | 'minimal' | 'creative'

export const TEMPLATE_OPTIONS: { id: InvoiceTemplate; name: string; description: string }[] = [
  { id: 'professional', name: 'Professional', description: 'Clean, classic design' },
  { id: 'modern', name: 'Modern', description: 'Bold & contemporary' },
  { id: 'minimal', name: 'Minimal', description: 'Simple & elegant' },
  { id: 'creative', name: 'Creative', description: 'Colorful & unique' },
]

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
]

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
  currency: 'USD',
  currencySymbol: '$',
  template: 'professional',
}
