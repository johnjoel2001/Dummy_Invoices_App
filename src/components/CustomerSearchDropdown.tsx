import { useState, useRef, useEffect } from 'react'
import { Customer } from '../types/invoice'
import { Search, ChevronDown, X, User } from 'lucide-react'

interface CustomerSearchDropdownProps {
  customers: Customer[]
  selectedCustomerId: string
  onSelect: (customerId: string) => void
  placeholder?: string
}

const CustomerSearchDropdown = ({
  customers,
  selectedCustomerId,
  onSelect,
  placeholder = 'Search or select a customer...'
}: CustomerSearchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li')
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleSelectCustomer = (customerId: string) => {
    onSelect(customerId)
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect('')
    setSearchQuery('')
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredCustomers[highlightedIndex]) {
          handleSelectCustomer(filteredCustomers[highlightedIndex].id)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
        break
    }
  }

  // Format customer name for display (Title Case)
  const formatCustomerName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery || (selectedCustomer && !isOpen ? formatCustomerName(selectedCustomer.name) : '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {selectedCustomerId && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear selection"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <button
            onClick={() => {
              setIsOpen(!isOpen)
              if (!isOpen) inputRef.current?.focus()
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredCustomers.length === 0 ? (
            <li className="px-4 py-3 text-gray-500 text-center">
              {searchQuery ? 'No customers found' : 'No customers available'}
            </li>
          ) : (
            filteredCustomers.map((customer, index) => (
              <li
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id)}
                className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center gap-3 ${
                  highlightedIndex === index
                    ? 'bg-indigo-50'
                    : selectedCustomerId === customer.id
                    ? 'bg-indigo-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`font-medium truncate text-left ${
                    selectedCustomerId === customer.id ? 'text-indigo-700' : 'text-gray-900'
                  }`}>
                    {formatCustomerName(customer.name)}
                  </p>
                  {(customer.phone || customer.email) && (
                    <p className="text-xs text-gray-500 truncate text-left">
                      {customer.phone && <span>{customer.phone}</span>}
                      {customer.phone && customer.email && <span className="mx-1">•</span>}
                      {customer.email && <span>{customer.email}</span>}
                    </p>
                  )}
                </div>
                {selectedCustomerId === customer.id && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default CustomerSearchDropdown
