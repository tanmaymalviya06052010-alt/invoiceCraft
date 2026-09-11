'use client'

import { Address } from '@/types/invoice'
import CountrySelect from './CountrySelect'

interface AddressFormProps {
  value: Address
  onChange: (address: Address) => void
  label?: string
}

export default function AddressForm({ value, onChange, label = 'Address' }: AddressFormProps) {
  const updateField = (field: keyof Address, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleCountryChange = (countryCode: string) => {
    const country = require('@/types/invoice').COUNTRIES.find((c: { code: string }) => c.code === countryCode)
    onChange({
      ...value,
      countryCode,
      country: country?.name || '',
    })
  }

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>
      <input
        type="text"
        className="input-field"
        value={value.street}
        onChange={(e) => updateField('street', e.target.value)}
        placeholder="Street address, P.O. box, company name"
        maxLength={200}
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          type="text"
          className="input-field"
          value={value.city}
          onChange={(e) => updateField('city', e.target.value)}
          placeholder="City"
          maxLength={100}
        />
        <input
          type="text"
          className="input-field"
          value={value.state}
          onChange={(e) => updateField('state', e.target.value)}
          placeholder="State/Province"
          maxLength={100}
        />
        <input
          type="text"
          className="input-field"
          value={value.zip}
          onChange={(e) => updateField('zip', e.target.value)}
          placeholder="ZIP/Postal"
          maxLength={20}
        />
      </div>
      <CountrySelect value={value.countryCode} onChange={handleCountryChange} placeholder="Select country" />
    </div>
  )
}
