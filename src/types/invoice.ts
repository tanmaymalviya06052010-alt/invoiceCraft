export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
  countryCode: string
}

export interface ContactInfo {
  name: string
  email: string
  phone: string
  phoneCode: string
  address: Address
  taxId?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate: string
  
  // From (Business)
  from: ContactInfo
  
  // Client
  client: ContactInfo
  
  // Items
  items: InvoiceItem[]
  
  // Totals
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  
  // Additional Info
  notes: string
  terms: string
  paymentTerms: string
  poNumber?: string
  
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

export const PAYMENT_TERMS = [
  'Due on Receipt',
  'Net 7',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
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

export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', phoneCode: '+86' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phoneCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phoneCode: '+52' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', phoneCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phoneCode: '+966' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', phoneCode: '+64' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phoneCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', phoneCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', phoneCode: '+45' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phoneCode: '+27' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', phoneCode: '+351' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', phoneCode: '+7' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phoneCode: '+82' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', phoneCode: '+90' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', phoneCode: '+48' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', phoneCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', phoneCode: '+56' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', phoneCode: '+57' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', phoneCode: '+63' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phoneCode: '+60' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', phoneCode: '+66' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', phoneCode: '+62' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', phoneCode: '+84' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', phoneCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', phoneCode: '+254' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', phoneCode: '+20' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', phoneCode: '+972' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', phoneCode: '+353' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', phoneCode: '+358' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', phoneCode: '+43' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', phoneCode: '+32' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', phoneCode: '+30' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', phoneCode: '+420' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', phoneCode: '+40' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', phoneCode: '+380' },
]

export const DEFAULT_ADDRESS: Address = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  countryCode: '',
}

export const DEFAULT_CONTACT: ContactInfo = {
  name: '',
  email: '',
  phone: '',
  phoneCode: '+1',
  address: { ...DEFAULT_ADDRESS },
  taxId: '',
}

export const defaultInvoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
  status: 'draft',
  createdAt: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  
  from: { ...DEFAULT_CONTACT },
  client: { ...DEFAULT_CONTACT },
  
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
  terms: 'Payment is due within 30 days of invoice date. Late payments are subject to a 1.5% monthly fee.',
  paymentTerms: 'Net 30',
  
  brandColor: '#3b82f6',
  currency: 'USD',
  currencySymbol: '$',
  template: 'professional',
}
