import React from 'react'
import { Plus, X } from 'lucide-react'
import type { ConfirmationPopup as ConfirmationPopupType } from '../../typings/pos.types'

interface ConfirmationPopupProps {
  confirmationPopup: ConfirmationPopupType
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  confirmationPopup,
  onConfirm,
  onCancel,
}) => {
  if (!confirmationPopup.isOpen || !confirmationPopup.item) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="relative">
          <img
            src={confirmationPopup.item.image}
            alt={confirmationPopup.item.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 bg-white text-amber-600 p-2 rounded-full hover:bg-amber-50 transition-colors"
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
          <p className="text-amber-600 mb-6">
            {confirmationPopup.item.description}
          </p>

          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-medium">Giá tiền:</span>
              <span className="text-xl font-bold text-amber-800">
                {confirmationPopup.item.price.toLocaleString()}đ
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
              onClick={onConfirm}
              className="flex-1 bg-amber-100 text-amber-800 py-3 rounded-lg font-bold hover:bg-amber-200 transition-colors flex items-center justify-center space-x-2 border border-amber-300"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm vào đơn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
