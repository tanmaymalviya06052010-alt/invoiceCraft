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
    if (onCountryChange) {
      onCountryChange(country.code, country.phoneCode)
    }
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="flex w-full" ref={dropdownRef}>
      {/* Country code selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          className="h-full px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm text-gray-700">{phoneCode}</span>
          <FiChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Search input */}
            <div className="sticky top-0 p-2 bg-white border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            {/* Country list */}
            <div className="overflow-y-auto max-h-48">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 text-left ${
                      phoneCode === country.phoneCode ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-gray-900">{country.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{country.phoneCode}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone number input */}
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value, phoneCode)}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
      />
    </div>
  )
}
