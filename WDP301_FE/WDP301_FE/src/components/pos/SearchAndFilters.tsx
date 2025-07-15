import React from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  priceFilter: 'all' | 'low' | 'medium' | 'high'
  setPriceFilter: (filter: 'all' | 'low' | 'medium' | 'high') => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  priceFilter,
  setPriceFilter,
  showFilters,
  setShowFilters,
}) => {
  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none text-amber-700 placeholder-amber-400"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors font-medium ${
            showFilters || priceFilter !== 'all'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Bộ lọc</span>
          {priceFilter !== 'all' && (
            <span className="bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
              1
            </span>
          )}
        </button>
      </div>

      {/* Price Filter */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-3">Lọc theo giá</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'Tất cả', range: '' },
              { id: 'low', label: 'Bình dân', range: '≤ 50.000đ' },
              { id: 'medium', label: 'Trung bình', range: '50k - 100k' },
              { id: 'high', label: 'Cao cấp', range: '> 100.000đ' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() =>
                  setPriceFilter(filter.id as 'all' | 'low' | 'medium' | 'high')
                }
                className={`p-3 rounded-lg font-medium transition-colors border text-center ${
                  priceFilter === filter.id
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <div className="font-bold text-sm">{filter.label}</div>
                {filter.range && (
                  <div className="text-xs opacity-75 mt-1">{filter.range}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
