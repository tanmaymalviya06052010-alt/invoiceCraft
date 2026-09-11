'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import { COUNTRIES } from '@/types/invoice'

interface CountrySelectProps {
  value: string
  onChange: (countryCode: string, phoneCode: string) => void
  placeholder?: string
  showPhoneCode?: boolean
}

export default function CountrySelect({ 
  value, 
  onChange, 
  placeholder = 'Select country',
  showPhoneCode = false 
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedCountry = COUNTRIES.find(c => c.code === value)

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
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
    onChange(country.code, country.phoneCode)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="input-field flex items-center gap-2 text-left"
      >
        {selectedCountry ? (
          <>
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="flex-1 truncate">{selectedCountry.name}</span>
            {showPhoneCode && (
              <span className="text-gray-500">{selectedCountry.phoneCode}</span>
            )}
          </>
        ) : (
          <span className="text-gray-400 flex-1">{placeholder}</span>
        )}
        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="sticky top-0 p-2 bg-white border-b border-gray-100">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
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
                    value === country.code ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm text-gray-900">{country.name}</span>
                  {showPhoneCode && (
                    <span className="text-xs text-gray-500">{country.phoneCode}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
