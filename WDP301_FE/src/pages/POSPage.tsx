import React, { useState, useEffect, useCallback } from 'react'
import { SearchAndFilters } from '../components/pos/SearchAndFilters'
import { CategoryTabs } from '../components/pos/CategoryTabs'
import { MenuGrid } from '../components/pos/MenuGrid'
import { OrderSidebar } from '../components/pos/OrderSidebar'
import { ConfirmationPopup } from '../components/pos/ConfirmationPopup'
import { CheckoutPage } from '../components/pos/CheckoutPage'
import { usePOSApi } from '../hooks/posApi'
import type { Product } from '../hooks/posApi'
import type {
  MenuItem,
  OrderItem,
  ConfirmationPopup as ConfirmationPopupType,
  CheckoutData,
} from '../typings/pos.types'
import POSSuccess from '../components/pos/POSSuccess'
import type { Promotion } from '../hooks/promotionApi'

export const POSPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all') 
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [orderNumber, setOrderNumber] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all')
  const [showFilters, setShowFilters] = useState(false)
  const [confirmationPopup, setConfirmationPopup] =
    useState<ConfirmationPopupType>({
      isOpen: false,
      item: null,
    })
  const [showCheckout, setShowCheckout] = useState(false)
  const [promotionInfo, setPromotionInfo] = useState<Promotion | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [promotionCode, setPromotionCode] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const { getProductsByType, getAllProducts } = usePOSApi()
  const [showSuccess, setShowSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | undefined>(
    undefined
  )

  const fetchProducts = useCallback(async () => {
    if (!activeCategory) return
  
    setLoading(true)
    try {
      console.log('Fetching products for category:', activeCategory)
  
      const data =
        activeCategory === 'all'
          ? await getAllProducts()
          : await getProductsByType(activeCategory)
  
      console.log('Products fetched:', data)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [activeCategory, getProductsByType, getAllProducts])

  useEffect(() => {
    console.log('useEffect triggered - activeCategory:', activeCategory)
    fetchProducts()
  }, [fetchProducts])

  const showConfirmation = (item: MenuItem) => {
    setConfirmationPopup({
      isOpen: true,
      item: item,
    })
  }

  const confirmAddToOrder = () => {
    if (!confirmationPopup.item) return

    const item = confirmationPopup.item
    const existingItem = currentOrder.find(
      (orderItem) => orderItem.id === item.id
    )
    if (existingItem) {
      setCurrentOrder(
        currentOrder.map((orderItem) =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      )
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }])
    }

    setConfirmationPopup({ isOpen: false, item: null })
  }

  const cancelAddToOrder = () => {
    setConfirmationPopup({ isOpen: false, item: null })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCurrentOrder(currentOrder.filter((item) => item.id !== id))
    } else {
      setCurrentOrder(
        currentOrder.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const removeFromOrder = (id: string) => {
    setCurrentOrder(currentOrder.filter((item) => item.id !== id))
  }

  const clearOrder = () => {
    setCurrentOrder([])
  }

  const getTotalPrice = () => {
    return currentOrder.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const completeOrder = (
    promo: Promotion | null,
    discount: number,
    code: string
  ) => {
    if (currentOrder.length === 0) return
    setPromotionInfo(promo)
    setDiscountAmount(discount)
    setPromotionCode(code)
    setShowCheckout(true)
  }

  const handleBackToMenu = () => {
    setShowCheckout(false)
  }

  const handleCompleteCheckout = (checkoutData: CheckoutData) => {
    alert(
      `Đơn hàng #${checkoutData.orderNumber} đã được hoàn thành!\n` +
        `Khách hàng: ${checkoutData.customerPhone}\n` +
        `Phương thức: ${
          checkoutData.paymentMethod === 'cash'
            ? 'Tiền mặt'
            : checkoutData.paymentMethod === 'card'
            ? 'Thẻ ngân hàng'
            : 'Chuyển khoản'
        }\n` +
        `Tổng tiền: ${checkoutData.totalAmount.toLocaleString()}đ`
    )

    setCurrentOrder([])
    setOrderNumber(orderNumber + 1)
    setShowCheckout(false)
    setSuccessOrderId(
      checkoutData.orderNumber ? String(checkoutData.orderNumber) : undefined
    )
    setShowSuccess(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriceFilter('all')
    setShowFilters(false)
  }

  const filteredItems = products.filter((item) => {
    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    // Price filter
    let matchesPrice = true
    if (priceFilter === 'low') {
      matchesPrice = item.price <= 50000
    } else if (priceFilter === 'medium') {
      matchesPrice = item.price > 50000 && item.price <= 100000
    } else if (priceFilter === 'high') {
      matchesPrice = item.price > 100000
    }
    return matchesSearch && matchesPrice
  })

  // Map Product -> MenuItem
  const mappedItems: MenuItem[] = filteredItems.map((item) => ({
    id: item.productId.toString(),
    name: item.name,
    price: item.price,
    description: item.description,
    category: item.productTypeId.toString(),
    image: item.image,
  }))

  // Check if user is logged in
  const token = localStorage.getItem('token')
  if (!token) {
    return (
      <div className="min-h-screen bg-amber-25 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            Vui lòng đăng nhập
          </h2>
          <p className="text-amber-600">Bạn cần đăng nhập để sử dụng POS</p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <POSSuccess
        orderId={successOrderId}
        onCreateNewOrder={() => {
          setShowSuccess(false)
          setCurrentOrder([])
        }}
      />
    )
  }

  if (showCheckout) {
    return (
      <CheckoutPage
        orderItems={currentOrder}
        totalAmount={getTotalPrice()}
        orderNumber={orderNumber}
        onBack={handleBackToMenu}
        onCompleteOrder={handleCompleteCheckout}
        promotionInfo={promotionInfo}
        discountAmount={discountAmount}
        promotionCode={promotionCode}
      />
    )
  }

  return (
    <div className="min-h-screen bg-amber-25 flex">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-amber-200 px-6 py-4 space-y-4">
          <SearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          <CategoryTabs
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
        <MenuGrid
          filteredItems={mappedItems}
          searchTerm={searchTerm}
          priceFilter={priceFilter}
          onItemClick={showConfirmation}
          onClearFilters={clearFilters}
          loading={loading}
        />
      </div>
      <OrderSidebar
        currentOrder={currentOrder}
        onUpdateQuantity={updateQuantity}
        onRemoveFromOrder={removeFromOrder}
        onClearOrder={clearOrder}
        onCompleteOrder={completeOrder}
        getTotalPrice={getTotalPrice}
      />
      <ConfirmationPopup
        confirmationPopup={confirmationPopup}
        onConfirm={confirmAddToOrder}
        onCancel={cancelAddToOrder}
      />
    </div>
  )
}
