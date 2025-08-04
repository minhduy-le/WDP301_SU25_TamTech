import React, { useEffect, useState, useCallback } from 'react'
import { Store, Clock, User } from 'lucide-react'
import { usePOSApi } from '../../hooks/posApi'

interface HeaderProps {
  orderNumber: number
}

export const Header: React.FC<HeaderProps> = ({ orderNumber }) => {
  const { getLatestOrder } = usePOSApi()
  const [latestOrderId, setLatestOrderId] = useState<number | null>(null)

  const fetchLatestOrder = useCallback(async () => {
    const latestOrder = await getLatestOrder()
    if (latestOrder) {
      setLatestOrderId(latestOrder.orderId)
    }
  }, [getLatestOrder])

  useEffect(() => {
    fetchLatestOrder()
  }, [fetchLatestOrder])

  // Use latestOrderId + 1 if available, otherwise use the prop orderNumber
  const displayOrderNumber = latestOrderId ? latestOrderId + 1 : orderNumber

  return (
    <header className="bg-amber-50 border-b border-amber-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-800">
              Quán Cơm Tấm Tắc
            </h1>
            <p className="text-amber-600 text-sm">Hệ thống bán hàng</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700 font-medium text-sm">
              {new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-lg">
            <User className="h-4 w-4 text-amber-700" />
            <span className="text-amber-700 font-medium text-sm">
              Đơn #{displayOrderNumber}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
