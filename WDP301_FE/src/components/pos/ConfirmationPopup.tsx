import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { ConfirmationPopup as ConfirmationPopupType, AddOnItem } from '../../typings/pos.types'
import { useAddOnProducts } from '../../hooks/posApi'

interface ConfirmationPopupProps {
  confirmationPopup: ConfirmationPopupType
  onConfirm: (addOns: AddOnItem[], totalPrice: number) => void
  onCancel: () => void
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  confirmationPopup,
  onConfirm,
  onCancel,
}) => {
  const { addOnProducts, loading: addOnsLoading } = useAddOnProducts()
  const [selectedAddOns, setSelectedAddOns] = useState<{ [key: string]: number }>({})
  const [mainQuantity, setMainQuantity] = useState(1)

  useEffect(() => {
    if (confirmationPopup.isOpen) {
      setSelectedAddOns({})
      setMainQuantity(1)
    }
  }, [confirmationPopup.isOpen])

  const handleAddOnQuantityChange = (productId: number, change: number) => {
    const key = productId.toString()
    const currentQty = selectedAddOns[key] || 0
    const newQty = Math.max(0, currentQty + change)
    
    setSelectedAddOns(prev => ({
      ...prev,
      [key]: newQty
    }))
  }

  const calculateTotalPrice = () => {
    if (!confirmationPopup.item) return 0
    
    const basePrice = confirmationPopup.item.price * mainQuantity
    
    const addOnPrice = addOnProducts.reduce((total, category) => {
      return total + category.products.reduce((catTotal, product) => {
        const quantity = selectedAddOns[product.productId.toString()] || 0
        return catTotal + (product.price * quantity)
      }, 0)
    }, 0)
    
    return basePrice + addOnPrice
  }

  const handleConfirm = () => {
    if (!confirmationPopup.item) return

    const selectedAddOnItems: AddOnItem[] = []
    
    addOnProducts.forEach(category => {
      category.products.forEach(product => {
        const quantity = selectedAddOns[product.productId.toString()] || 0
        if (quantity > 0) {
          selectedAddOnItems.push({
            productId: product.productId,
            productTypeName: product.name,
            quantity,
            price: product.price
          })
        }
      })
    })

    const totalPrice = calculateTotalPrice()
    onConfirm(selectedAddOnItems, totalPrice)
    
    setSelectedAddOns({})
    setMainQuantity(1)
  }

  if (!confirmationPopup.isOpen || !confirmationPopup.item) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 mt-16">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={confirmationPopup.item.image}
            alt={confirmationPopup.item.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 bg-white text-amber-600 p-2 rounded-full hover:bg-amber-50 transition-colors border-none"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded border border-amber-200">
            <span className="font-bold text-amber-700">
              {confirmationPopup.item.price.toLocaleString()}đ
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-amber-800 mb-3">
            {confirmationPopup.item.name}
          </h3>
          <p className="text-amber-600 mb-4">
            {confirmationPopup.item.description}
          </p>

          <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium">Số lượng món chính:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMainQuantity(Math.max(1, mainQuantity - 1))}
                  className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center hover:bg-amber-300 transition-colors font-bold text-lg"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                >
                  −
                </button>
                <span className="font-bold text-amber-800 min-w-[3rem] text-center text-lg px-2">
                  {mainQuantity}
                </span>
                <button
                  onClick={() => setMainQuantity(mainQuantity + 1)}
                  className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center hover:bg-amber-300 transition-colors font-bold text-lg"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {addOnsLoading ? (
            <div className="text-center py-4">
              <span className="text-amber-600">Đang tải món ăn kèm...</span>
            </div>
          ) : addOnProducts.length > 0 ? (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-amber-800 mb-3">Món ăn kèm (tuỳ chọn)</h4>
              {addOnProducts.map(category => (
                <div key={category.typeId} className="mb-4">
                  <h5 className="font-medium text-amber-700 mb-2">{category.typeName}</h5>
                  <div className="space-y-2">
                    {category.products.map(product => {
                      const quantity = selectedAddOns[product.productId.toString()] || 0
                      return (
                        <div key={product.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800">{product.name}</span>
                            <span className="text-sm text-amber-600 ml-2">
                              +{product.price.toLocaleString()}đ
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddOnQuantityChange(product.productId, -1)}
                              className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors font-bold"
                              style={{ minWidth: '28px', minHeight: '28px' }}
                            >
                              −
                            </button>
                            <span className="font-medium text-gray-800 min-w-[2rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleAddOnQuantityChange(product.productId, 1)}
                              className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center hover:bg-amber-300 transition-colors font-bold"
                              style={{ minWidth: '28px', minHeight: '28px' }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium">Tổng tiền:</span>
              <span className="text-xl font-bold text-amber-800">
                {calculateTotalPrice().toLocaleString()}đ
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-amber-100 text-amber-800 py-3 rounded-lg font-bold hover:bg-amber-200 transition-colors flex items-center justify-center space-x-2 border border-amber-300"
            >
              <span className="text-lg">+</span>
              <span>Thêm vào đơn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
