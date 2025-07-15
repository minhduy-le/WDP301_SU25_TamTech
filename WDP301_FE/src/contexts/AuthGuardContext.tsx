import { useAuthStore } from '../hooks/usersApi'
import { createContext, useEffect, type PropsWithChildren } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { jwtDecode } from 'jwt-decode'

type UserRole = 'User' | 'Shipper' | 'Staff' | 'Admin' | 'Manager'

type AuthGuardContextType = Record<string, unknown>

type AuthGuardProviderProps = PropsWithChildren

const AuthGuardContext = createContext<AuthGuardContextType>({})

export function AuthGuardProvider(props: AuthGuardProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { children } = props
  const { user, logout, token, setUser, setToken } = useAuthStore()

  useEffect(() => {
    if (!user || !token) {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    }

    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token)
        const currentTime = Math.floor(Date.now() / 1000)

        if (decoded.exp < currentTime) {
          message.warning('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
          logout()
          return
        }
      } catch (error) {
        console.error('Error decoding token:', error)
        logout()
      }
    }
  }, [token, user, setUser, setToken, logout])

  useEffect(() => {
    const publicRoutes = [
      '/',
      '/login',
      '/register',
      '/verify-email',
      '/verify-otp',
      '/forgot-password',
      '/menu',
      '/product/:productId',
      '/blog',
      '/blog/:id',
    ]

    const matchDynamicRoute = (routePattern: string, path: string) => {
      const dynamicRoutePattern = routePattern
        .replace(/:productId/, '[0-9]+')
        .replace(/:id/, '[0-9]+')
      const regex = new RegExp(`^${dynamicRoutePattern}$`)
      return regex.test(path)
    }

    if (!user || !user.role) {
      if (
        publicRoutes.some((route) =>
          matchDynamicRoute(route, location.pathname)
        ) ||
        publicRoutes.includes(location.pathname)
      ) {
        return
      }
      navigate('/login', { replace: true })
      return
    }

    const roleRedirects: Record<UserRole, string> = {
      User: '/',
      Staff: '/staff/orders',
      Shipper: '/',
      Admin: '/admin/dashboard',
      Manager: '/manager/dashboard',
    }

    if (location.pathname === '/') {
      navigate(roleRedirects[user.role as UserRole], { replace: true })
      return
    }

    const restrictedPages: Record<UserRole, string[]> = {
      Staff: [
        '/staff/orders',
        '/staff/profile',
        '/staff/chat',
        '/staff/pos',
        '/staff/pos-success',
      ],
      User: ['/checkout', '/payment-success', '/user-information'],
      Shipper: [],
      Manager: [
        '/manager/dashboard',
        '/manager/orders',
        '/manager/orders/confirm-orders',
        '/manager/products',
        '/manager/promotions',
        '/manager/staffs',
        '/manager/feedback',
        '/manager/chat',
        '/manager/staffs/staffId',
        '/manager/materials',
        '/manager/profile',
        '/manager/blog',
      ],
      Admin: [
        '/admin/dashboard',
        '/admin/users',
        '/admin/system-issues',
        '/admin/profile',
        '/admin/chat',
      ],
    }

    const userRole = user.role as UserRole
    const allowedPages = restrictedPages[userRole] || []
    const isAllowed =
      publicRoutes.some((route) =>
        matchDynamicRoute(route, location.pathname)
      ) ||
      publicRoutes.includes(location.pathname) ||
      allowedPages.some((route) => {
        if (
          route.includes(':productId') ||
          route.includes(':orderId') ||
          route.includes(':id')
        ) {
          return matchDynamicRoute(route, location.pathname)
        }
        return route === location.pathname
      })

    if (!isAllowed) {
      navigate('/forbidden', { replace: true })
    }
  }, [user, location, navigate])

  return (
    <AuthGuardContext.Provider value={{}}>{children}</AuthGuardContext.Provider>
  )
}

export default AuthGuardContext
