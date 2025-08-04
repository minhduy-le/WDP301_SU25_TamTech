import React, { useEffect, useState, useCallback } from 'react'
import { usePOSApi } from '../../hooks/posApi'
import type { ProductType } from '../../hooks/posApi'

interface CategoryTabsProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  const { getProductTypes } = usePOSApi()
  const [categories, setCategories] = useState<ProductType[]>([])

  const fetchCategories = useCallback(async () => {
    const data = await getProductTypes()
    const activeTypes = data.filter((item) => item.isActive)  
    setCategories(activeTypes)
  }, [getProductTypes])
  
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 pt-2 pl-1">
      <button
        onClick={() => setActiveCategory('all')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
          activeCategory === 'all'
            ? 'bg-amber-100 text-amber-800 border border-amber-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-200 focus:outline-none hover:border-amber-400'
            : 'bg-white text-amber-600 border-amber-200 focus:ring-1 focus:ring-amber-50 focus:outline-none hover:border-amber-400'
        }`}
      >
        <span>Tất cả</span>
      </button>

      {categories.map((category: any) => (
        <button
          key={category.productTypeId}
          onClick={() => setActiveCategory(category.productTypeId.toString())}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeCategory === category.productTypeId.toString()
              ? 'bg-amber-100 text-amber-800 border border-amber-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-200 focus:outline-none hover:border-amber-400'
              : 'bg-white text-amber-600 border-amber-200 focus:ring-1 focus:ring-amber-50 focus:outline-none hover:border-amber-400'
          }`}
        >
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}
