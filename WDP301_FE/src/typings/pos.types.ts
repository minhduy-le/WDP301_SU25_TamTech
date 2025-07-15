export interface MenuItem {
  id: string
  name: string
  price: number
  description: string
  category: string
  image: string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  quantity: number
}

export interface ConfirmationPopup {
  isOpen: boolean
  item: MenuItem | null
}

export interface CheckoutData {
  customerPhone: string
  paymentMethod: 'cash' | 'card' | 'transfer'
  orderItems: OrderItem[]
  totalAmount: number
  orderNumber: number
}

export interface Category {
  id: string
  name: string
  icon: string
}
