import axios from '../config/axios'
import { AxiosError } from 'axios'
import { useCallback, useState, useEffect } from 'react'

export interface ProductType {
  productTypeId: number
  name: string
  isActive: boolean
}

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

export interface Product {
  productId: number
  name: string
  description: string
  price: number
  image: string
  productTypeId: number
  isActive: boolean
  ProductRecipes?: ProductRecipe[] 
}


export interface OrderItem {
  productId: number
  name: string
  quantity: number
  price: number
}

export interface LatestOrderResponse {
  orderId: number
  userId: number
  payment_time: string | null
  order_create_at: string
  order_address: string
  status: string
  fullName: string
  phone_number: string
  orderItems: OrderItem[]
  orderItemsCount: number
  order_shipping_fee: number
  order_discount_value: number
  order_amount: number
  invoiceUrl: string | null
  order_point_earn: number
  note: string
  payment_method: string
}

export const usePOSApi = () => {
  const getLatestOrder =
    useCallback(async (): Promise<LatestOrderResponse | null> => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No token found in localStorage')
          return null
        }

        const response = await axios.get('/orders/latest/order', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        })

        return response.data
      } catch (error) {
        console.error('Error fetching latest order:', error)
        return null
      }
    }, [])

  const getProductTypes = useCallback(async (): Promise<ProductType[]> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        return []
      }

      const response = await axios.get('/product-types', {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      })

      return response.data
    } catch (error) {
      console.error('Error fetching product types:', error)
      return []
    }
  }, [])

  const getProductsByType = useCallback(
    async (typeId: string | number): Promise<Product[]> => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No token found in localStorage')
          return []
        }
        const response = await axios.get(`/products/type/${typeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        })
        return response.data.products || []
      } catch (error) {
        console.error('Error fetching products by type:', error)
        return []
      }
    },
    []
  )
  
  const getAllProducts = useCallback(async (): Promise<Product[]> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        return []
      }

      const response = await axios.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      })

      return response.data.products || []
    } catch (error) {
      console.error('Error fetching all products:', error)
      return []
    }
  }, [])

  const createOrder = useCallback(
    async (orderData: Record<string, unknown>) => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')
        const response = await axios.post('/pos-orders', orderData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        })
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw error.response?.data || error.message || error
        }
        throw error
      }
    },
    []
  )

  const cancelOrder = useCallback(
    async (orderId: number) => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')
        
        const response = await axios.put(`/pos-orders/${orderId}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        })
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw error.response?.data || error.message || error
        }
        throw error
      }
    },
    []
  )

  return {
    getLatestOrder,
    getProductTypes,
    getProductsByType,
    getAllProducts,
    createOrder,
    cancelOrder,
  }
}

// Hook for add-on products (similar to Menu.tsx)
export const useAddOnProducts = () => {
  const { getProductTypes, getProductsByType } = usePOSApi()
  const [addOnProducts, setAddOnProducts] = useState<{
    typeId: number;
    typeName: string;
    products: Product[];
    loading: boolean;
  }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAddOnProducts = async () => {
      setLoading(true)
      try {
        const productTypes = await getProductTypes()
        const addOnTypes = productTypes.filter(type => type.productTypeId !== 1 && type.isActive)
        
        const addOnPromises = addOnTypes.map(async (type) => {
          try {
            const products = await getProductsByType(type.productTypeId)
            return {
              typeId: type.productTypeId,
              typeName: type.name,
              products: products || [],
              loading: false
            }
          } catch (error) {
            console.error(`Error fetching products for type ${type.productTypeId}:`, error)
            return {
              typeId: type.productTypeId,
              typeName: type.name,
              products: [],
              loading: false
            }
          }
        })

        const results = await Promise.all(addOnPromises)
        setAddOnProducts(results)
      } catch (error) {
        console.error('Error fetching add-on products:', error)
        setAddOnProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAddOnProducts()
  }, [getProductTypes, getProductsByType])

  return { addOnProducts, loading }
}
