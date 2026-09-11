'use client'

import { ContactInfo, Address } from '@/types/invoice'
import PhoneInput from './PhoneInput'
import AddressForm from './AddressForm'

interface ContactFormProps {
  value: ContactInfo
  onChange: (contact: ContactInfo) => void
  label: string
  showTaxId?: boolean
}

export default function ContactForm({ value, onChange, label, showTaxId = false }: ContactFormProps) {
  const updateField = (field: keyof ContactInfo, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handlePhoneChange = (phone: string, phoneCode: string) => {
    onChange({ ...value, phone, phoneCode })
  }

  const handleCountryChange = (countryCode: string, phoneCode: string) => {
    onChange({ ...value, phoneCode })
  }

  const handleAddressChange = (address: Address) => {
    onChange({ ...value, address })
  }

  return (
    <div className="card-elevated">
      <h2 className="text-display-sm text-surface-900 mb-5">{label}</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="label">Name / Business</label>
          <input
            type="text"
            className="input-field"
            value={value.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="John's Design Studio"
            maxLength={200}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              value={value.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@example.com"
              maxLength={254}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <PhoneInput
              value={value.phone}
              phoneCode={value.phoneCode}
              countryCode={value.address.countryCode}
              onChange={handlePhoneChange}
              onCountryChange={handleCountryChange}
              placeholder="Phone number"
            />
          </div>
        </div>

        {/* Tax ID */}
        {showTaxId && (
          <div>
            <label className="label">Tax ID / VAT Number</label>
            <input
              type="text"
              className="input-field font-mono"
              value={value.taxId || ''}
              onChange={(e) => updateField('taxId', e.target.value)}
              placeholder="Optional"
              maxLength={50}
            />
          </div>
        )}

        {/* Address */}
        <AddressForm value={value.address} onChange={handleAddressChange} label="Address" />
      </div>
    </div>
  )
}
