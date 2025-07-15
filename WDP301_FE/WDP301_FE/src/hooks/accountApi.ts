import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../config/axios'
import axios from '../config/axios'

interface GenericApiResponse<T> {
  status: number
  message: string
  data?: T
}

export interface Account {
  id: number
  fullName: string
  email: string
  phone_number: string
  date_of_birth: string
  note: string
  role: string
  isActive: boolean
}

const fetchAccounts = async (): Promise<Account[]> => {
  const response = await axiosInstance.get('accounts')
  const {
    status,
    message: responseMessage,
    data,
  } = response.data as GenericApiResponse<Account[]>
  if (status >= 200 && status < 300 && data) {
    return Array.isArray(data) ? data : []
  }
  throw new Error(responseMessage || 'Không thể tải danh sách tài khoản')
}

export const useGetAccounts = () => {
  return useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  })
}

export const getCustomerByPhone = async (phone: string) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No token found')
  const response = await axios.get(`/accounts/phone/${phone}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  })
  return response.data.data
}
