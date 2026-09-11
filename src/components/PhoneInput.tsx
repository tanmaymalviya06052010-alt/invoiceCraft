'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import { COUNTRIES } from '@/types/invoice'

interface PhoneInputProps {
  value: string
  phoneCode: string
  countryCode: string
  onChange: (phone: string, phoneCode: string) => void
  onCountryChange?: (countryCode: string, phoneCode: string) => void
  placeholder?: string
}

export default function PhoneInput({
  value,
  phoneCode,
  countryCode,
  onChange,
  onCountryChange,
  placeholder = 'Phone number'
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedCountry = COUNTRIES.find(c => c.phoneCode === phoneCode) || COUNTRIES[0]

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.phoneCode.includes(search)
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    onChange(value, country.phoneCode)
    if (onCountryChange) { onCountryChange(country.code, country.phoneCode) }
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="flex w-full" ref={dropdownRef}>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 100) }}
          className="h-full px-3 bg-surface-50 border border-r-0 border-surface-200 rounded-l-2xl flex items-center gap-2 hover:bg-surface-100 transition-colors"
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-sm text-surface-600 font-medium">{phoneCode}</span>
          <FiChevronDown className={`w-3 h-3 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 left-0 mt-2 w-72 bg-white border border-surface-100 rounded-2xl shadow-elevated-xl overflow-hidden">
            <div className="sticky top-0 p-3 bg-white/80 backdrop-blur-xl border-b border-surface-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-surface-50 border border-surface-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-64 p-1">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-sm text-surface-400 text-center">No countries found</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-xl hover:bg-surface-50 text-left transition-colors ${
                      phoneCode === country.phoneCode ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span className="text-sm text-surface-700 font-medium">{country.name}</span>
                    <span className="text-xs text-surface-400 ml-auto font-mono">{country.phoneCode}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value, phoneCode)}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-4 py-3 bg-white border border-surface-200 rounded-r-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 hover:border-surface-300"
      />
    </div>
  )
}
