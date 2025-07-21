import React, { useState, useRef } from 'react'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Tag,
  ScanBarcode,
} from 'lucide-react'
import type { OrderItem } from '../../typings/pos.types'
import { useGetPromotionByCode, type Promotion } from '../../hooks/promotionApi'

interface OrderSidebarProps {
  currentOrder: OrderItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveFromOrder: (id: string) => void
  onClearOrder: () => void
  onCompleteOrder: (
    promotionInfo: Promotion | null,
    discountAmount: number,
    promotionCode: string
  ) => void
  getTotalPrice: () => number
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({
  currentOrder,
  onUpdateQuantity,
  onRemoveFromOrder,
  onClearOrder,
  onCompleteOrder,
  getTotalPrice,
}) => {
  const [promotionCode, setPromotionCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [promotionInfo, setPromotionInfo] = useState<Promotion | null>(null)
  const [promoError, setPromoError] = useState('')
  const [checkedPromo, setCheckedPromo] = useState(false)
  const {
    data: promotion,
    isFetching,
    isError,
  } = useGetPromotionByCode(checkedPromo ? promotionCode : '')

  const inputRef = useRef<HTMLInputElement>(null)

  const handleApplyPromotion = async () => {
    setPromoError('')
    setDiscountAmount(0)
    setPromotionInfo(null)
    setCheckedPromo(false)
    if (!promotionCode.trim()) return
    setCheckedPromo(true)
  }

  // Bắt sự kiện Enter để tự động áp dụng mã
  const handlePromoInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !discountAmount && !isFetching && promotionCode.trim()) {
      handleApplyPromotion()
    }
  }

  // Xử lý khi có kết quả từ API
  React.useEffect(() => {
    if (!checkedPromo) return
    if (isFetching) return
    if (isError || !promotion) {
      setPromoError('Mã giảm giá không hợp lệ hoặc có lỗi khi kiểm tra.')
      setDiscountAmount(0)
      setPromotionInfo(null)
      setCheckedPromo(false)
      return
    }
    // Kiểm tra logic
    if (!promotion.isActive) {
      setPromoError('Mã giảm giá không hoạt động.')
    } else {
      const now = new Date()
      if (new Date(promotion.startDate) > now) {
        setPromoError('Mã giảm giá chưa bắt đầu.')
      } else if (new Date(promotion.endDate) < now) {
        setPromoError('Mã giảm giá đã hết hạn.')
      } else if (promotion.NumberCurrentUses >= promotion.maxNumberOfUses) {
        setPromoError('Mã giảm giá đã hết lượt sử dụng.')
      } else if (getTotalPrice() < promotion.minOrderAmount) {
        setPromoError(
          `Đơn hàng phải tối thiểu ${promotion.minOrderAmount.toLocaleString()}đ để áp dụng mã.`
        )
      } else {
        setDiscountAmount(promotion.discountAmount)
        setPromotionInfo(promotion as Promotion)
        setPromoError('')
      }
    }
    setCheckedPromo(false)
  }, [checkedPromo, isFetching, isError, promotion, getTotalPrice])

  const handleRemovePromotion = () => {
    setPromotionCode('')
    setDiscountAmount(0)
    setPromotionInfo(null)
    setPromoError('')
    setCheckedPromo(false)
  }

  const finalTotal = getTotalPrice() - discountAmount

  return (
    <div className="w-80 bg-amber-50 border-l border-amber-200 flex flex-col max-h-screen">
      <div className="p-4 border-b border-amber-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-800 flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Đơn hàng hiện tại</span>
          </h2>
          {currentOrder.length > 0 && (
            <button
              onClick={onClearOrder}
              className="text-amber-600 hover:text-amber-700 p-1 rounded hover:bg-amber-100 transition-colors bg-white border border-amber-200 shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="bg-amber-100 rounded-lg p-3 border border-amber-200">
          <div className="text-amber-700 font-medium text-sm">
            {currentOrder.length} món •{' '}
            {currentOrder.reduce((total, item) => total + item.quantity, 0)} sản
            phẩm
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {currentOrder.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-amber-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-amber-400" />
            </div>
            <p className="text-amber-600 font-medium">Chưa có món nào</p>
            <p className="text-amber-500 text-sm mt-1">
              Hãy thêm những món ngon!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentOrder.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-3 border border-amber-200"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-amber-800 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-amber-600 text-xs mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveFromOrder(item.id)}
                    className="text-amber-500 hover:text-amber-700 p-1 rounded transition-colors flex-shrink-0 bg-white border border-amber-200 shadow-sm"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="bg-amber-100 text-amber-700 rounded p-1 hover:bg-amber-200 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-bold text-amber-700 min-w-[2rem] text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="bg-amber-100 text-amber-700 rounded p-1 hover:bg-amber-200 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-bold text-amber-700 text-sm">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Total and Actions */}
      {currentOrder.length > 0 && (
        <div className="p-4 border-t border-amber-200 flex-shrink-0 bg-white">
          {/* Promotion Code Section */}
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-4 w-4 text-amber-600" />
              <span className="text-amber-700 font-medium text-sm">
                Mã khuyến mãi
              </span>
            </div>
            {/* Input mã khuyến mãi */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập mã khuyến mãi..."
              value={promotionCode}
              onChange={(e) => setPromotionCode(e.target.value)}
              onKeyDown={handlePromoInputKeyDown}
              className="w-full h-10 px-3 text-sm rounded-lg outline-none bg-white text-amber-800 placeholder:text-amber-400 border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 shadow-sm"
              disabled={!!discountAmount}
              style={{ minWidth: 0, marginBottom: 8 }}
            />
            {/* Hàng nút bên dưới */}
            <div className="flex flex-row gap-2">
              {!discountAmount && (
                <button
                  type="button"
                  onClick={() => {
                    if (inputRef.current) inputRef.current.focus()
                  }}
                  className="h-10 px-4 flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
                  title="Quét mã bằng máy quét barcode"
                  disabled={!!discountAmount}
                >
                  <ScanBarcode className="h-5 w-5 mr-2" />
                  Quét mã
                </button>
              )}
              {!discountAmount ? (
                <button
                  onClick={handleApplyPromotion}
                  disabled={!promotionCode.trim() || isFetching}
                  className="h-10 px-4 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isFetching ? 'Đang kiểm tra...' : 'Áp dụng'}
                </button>
              ) : (
                <button
                  onClick={handleRemovePromotion}
                  className="h-10 px-4 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Hủy
                </button>
              )}
            </div>
            {/* Thông báo trạng thái mã khuyến mãi */}
            {promoError && (
              <div className="mt-2 flex items-center text-red-600 text-sm font-medium gap-1">
                <span>⚠️</span>
                <span>{promoError}</span>
              </div>
            )}
            {discountAmount > 0 && promotionInfo && (
              <div className="mt-2 flex items-center text-green-600 text-sm font-medium gap-1">
                <span>✔️</span>
                <span>
                  Giảm giá: -{discountAmount.toLocaleString()}đ ({promotionInfo.name})
                </span>
              </div>
            )}
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-amber-600 font-medium">Tạm tính:</span>
              <span className="font-bold text-amber-700">
                {getTotalPrice().toLocaleString()}đ
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="font-medium">Giảm giá:</span>
                <span className="font-bold">
                  -{discountAmount.toLocaleString()}đ
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg border-t border-amber-200 pt-2">
              <span className="font-bold text-amber-700">Tổng cộng:</span>
              <span className="font-bold text-amber-800">
                {finalTotal.toLocaleString()}đ
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              onCompleteOrder(promotionInfo, discountAmount, promotionCode)
            }
            className="w-full bg-amber-100 text-amber-800 py-3 rounded-lg font-bold hover:bg-amber-200 transition-colors flex items-center justify-center space-x-2 border border-amber-300"
          >
            <CreditCard className="h-5 w-5" />
            <span>Xác nhận đơn hàng</span>
          </button>
        </div>
      )}
    </div>
  )
}
