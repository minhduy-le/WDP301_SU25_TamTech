export interface Material {
  materialId: number
  name: string
  quantity: number
  barcode: string
  storeId: number
  isActive: boolean
}

export interface ProductRecipe {
  productRecipeId: number
  productId: number
  materialId: number
  quantity: number
  Material: Material
}

export interface MenuItem {
  id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  ProductRecipes?: ProductRecipe[] 
}

export interface AddOnItem {
  productId: number
  productTypeName: string
  quantity: number
  price: number
}

export interface OrderItem {
  id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  quantity: number
  addOns?: AddOnItem[]
  totalPrice?: number
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
