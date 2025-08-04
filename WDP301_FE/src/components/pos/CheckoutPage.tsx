import React, { useState } from 'react'
import {
  ArrowLeft,
  Phone,
  Smartphone,
  CheckCircle,
  Receipt,
} from 'lucide-react'
import type { OrderItem, CheckoutData } from '../../typings/pos.types'
import type { Promotion } from '../../hooks/promotionApi'
import { usePOSApi } from '../../hooks/posApi'
import { getCustomerByPhone } from '../../hooks/accountApi'
import { useNavigate } from 'react-router-dom'

interface CheckoutPageProps {
  orderItems: OrderItem[]
  totalAmount: number
  orderNumber: number
  onBack: () => void
  onCompleteOrder: (checkoutData: CheckoutData) => void
  promotionInfo: Promotion | null
  discountAmount: number
  promotionCode: string
}

interface CustomerInfo {
  id: number
  fullName: string
  email: string
  phone_number: string
  date_of_birth?: string
  note?: string | null
  role?: string
  isActive?: boolean
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  orderItems,
  totalAmount,
  orderNumber,
  onBack,
  onCompleteOrder,
  promotionInfo,
  discountAmount,
  promotionCode,
}) => {
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'transfer'>('transfer')
  const [isProcessing, setIsProcessing] = useState(false)
  const { createOrder } = usePOSApi()
  
  console.log('CheckoutPage - orderItems with addOns:', orderItems)
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [customerSearchError, setCustomerSearchError] = useState('')
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)

  const handlePhoneBlur = async () => {
    if (!customerPhone.trim()) return
    setIsSearchingCustomer(true)
    setCustomerSearchError('')
    setCustomerInfo(null)
    try {
      const data: CustomerInfo = await getCustomerByPhone(customerPhone.trim())
      setCustomerInfo(data)
    } catch {
      setCustomerSearchError('Không tìm thấy khách hàng với số điện thoại này.')
      setCustomerInfo(null)
    } finally {
      setIsSearchingCustomer(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setMessage(null)
    try {
      let payment_method_id = 4

      const apiOrderItems: Array<{productId: number, quantity: number, price: number}> = []
      
      orderItems.forEach((item) => {
        apiOrderItems.push({
          productId: Number(item.id),
          quantity: item.quantity,
          price: item.price,
        })
        
        if (item.addOns && item.addOns.length > 0) {
          item.addOns.forEach((addOn) => {
            if (addOn.quantity > 0) {
              apiOrderItems.push({
                productId: addOn.productId,
                quantity: addOn.quantity * item.quantity, // ✅ Nhân với quantity của món chính
                price: addOn.price,
              })
            }
          })
        }
      })
      
      console.log('POS Order Items being sent to API:', apiOrderItems)
      console.log('Original orderItems with addOns:', orderItems)

      const res = await createOrder({
        orderItems: apiOrderItems,
        order_discount_value: discountAmount,
        order_shipping_fee: 0,
        payment_method_id,
        order_address: 'Tại quầy',
        note: '',
        promotion_code: promotionCode,
        customer_phone: customerPhone,
        platform: 'web',
        ...(customerInfo?.id && { customerId: customerInfo.id }),
      })
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl
        return
      }
      setMessage('Tạo đơn hàng thành công!')
      const checkoutData: CheckoutData = {
        customerPhone,
        paymentMethod: 'transfer',
        orderItems,
        totalAmount,
        orderNumber,
      }
      if (res?.orderId) {
        navigate(`/staff/payment-success?orderId=${res.orderId}`)
        return
      }
      onCompleteOrder(checkoutData)
    } catch (err: unknown) {
      setMessage(
        'Tạo đơn hàng thất bại: ' + ((err as Error)?.message || String(err))
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentMethods = [
    {
      id: 'transfer' as const,
      name: 'Chuyển khoản',
      icon: Smartphone,
      description: 'Chuyển khoản qua ứng dụng',
    },
  ]

  return (
    <div className="min-h-screen bg-amber-25 flex">
      {/* Order Summary */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-amber-700 hover:text-amber-800 font-medium px-4 py-2 rounded-lg bg-white border border-amber-200 shadow-sm hover:bg-amber-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
            <div className="h-6 w-px bg-amber-200"></div>
            <h1 className="text-2xl font-bold text-amber-800">
              Xác nhận đơn hàng #{orderNumber}
            </h1>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-amber-200 mb-6">
            <div className="p-4 border-b border-amber-200">
              <h2 className="font-bold text-amber-800 flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Chi tiết đơn hàng</span>
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="border-b border-amber-100 last:border-b-0 pb-4 last:pb-0">
                    {/* Main Product */}
                    <div className="flex items-center space-x-4 py-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-amber-800">{item.name}</h3>
                        <p className="text-amber-600 text-sm line-clamp-1">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-amber-700 font-medium">
                            {(item.totalPrice || item.price).toLocaleString()}đ × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-800">
                          {(item.totalPrice ? (item.totalPrice * item.quantity) : (item.price * item.quantity)).toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                    
                    {/* Add-ons */}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="ml-20 space-y-2">
                        <div className="text-sm font-medium text-amber-700 mb-2">Món kèm:</div>
                        {item.addOns.map((addOn, index) => {
                          console.log('AddOn Debug:', { 
                            name: addOn.productTypeName, 
                            addOnQty: addOn.quantity, 
                            itemQty: item.quantity, 
                            totalQty: addOn.quantity * item.quantity 
                          })
                          return (
                            <div key={index} className="flex justify-between items-center py-1 px-3 bg-amber-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                <span className="text-sm text-amber-800">{addOn.productTypeName}</span>
                                <span className="text-xs text-amber-600">× {Math.floor(addOn.quantity * item.quantity)}</span>
                              </div>
                              <span className="text-sm font-medium text-amber-800">
                                {(addOn.price * addOn.quantity * item.quantity).toLocaleString()}đ
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-amber-200">
                {discountAmount > 0 && promotionInfo && (
                  <div className="flex justify-between items-center text-green-700 mb-2">
                    <span className="font-medium">
                      Giảm giá ({promotionInfo.name}):
                    </span>
                    <span className="font-bold">
                      - {discountAmount.toLocaleString()}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-amber-700">Tổng cộng:</span>
                  <span className="font-bold text-xl text-amber-800">
                    {(totalAmount - discountAmount).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="w-96 bg-white border-l border-amber-200 flex flex-col">
        <div className="p-6 border-b border-amber-200">
          <h2 className="text-xl font-bold text-amber-800">
            Thông tin thanh toán
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 p-6 space-y-6">
            {/* Customer Phone */}
            <div>
              <label className="block text-amber-700 font-medium mb-2">
                Số điện thoại khách hàng (tùy chọn)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none bg-white text-amber-800 placeholder:text-amber-400 shadow-sm"
                  onBlur={handlePhoneBlur}
                />
              </div>
              {isSearchingCustomer && (
                <div className="text-amber-600 text-sm mt-1">
                  Đang tìm kiếm khách hàng...
                </div>
              )}
              {customerInfo && (
                <div className="text-green-700 text-sm mt-1">
                  Khách: {customerInfo.fullName} ({customerInfo.email})
                </div>
              )}
              {customerSearchError && (
                <div className="text-red-600 text-sm mt-1">
                  {customerSearchError}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-amber-700 font-medium mb-3">
                Phương thức thanh toán
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-amber-200 hover:bg-amber-25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod('transfer')}
                        className="text-amber-600 focus:ring-amber-300"
                      />
                      <IconComponent className="h-5 w-5 text-amber-600" />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-amber-600">
                          {method.description}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3">
                Tóm tắt đơn hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-600">Số lượng món:</span>
                  <span className="font-medium text-amber-700">
                    {orderItems.reduce((total, item) => {
                      const addOnCount = item.addOns ? item.addOns.length : 0;
                      return total + 1 + addOnCount; 
                    }, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">Tổng sản phẩm:</span>
                  <span className="font-medium text-amber-700">
                    {orderItems.reduce((total, item) => {
                      const mainQuantity = item.quantity;
                      const addOnQuantity = item.addOns ? 
                        item.addOns.reduce((sum, addOn) => sum + addOn.quantity, 0) : 0;
                      return total + mainQuantity + addOnQuantity;
                    }, 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-200">
                  <span className="font-bold text-amber-700">Tổng tiền:</span>
                  <span className="font-bold text-amber-800">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-amber-200">
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                isProcessing
                  ? 'bg-amber-200 text-amber-600 cursor-not-allowed'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-600 border-t-transparent"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Hoàn thành đơn hàng</span>
                </>
              )}
            </button>
          </div>
        </form>
        {message && (
          <div
            style={{
              color: message.includes('thành công') ? 'green' : 'red',
              marginBottom: 8,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
