import React from 'react'
import { Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import SHIP from '../../assets/ship.png'

const POSSuccess: React.FC<{
  orderId?: string
  onCreateNewOrder?: () => void
}> = ({ orderId: propOrderId, onCreateNewOrder }) => {
  const navigate = useNavigate()
  const location = useLocation()
  // Lấy orderId từ query string nếu không có props
  const queryParams = new URLSearchParams(location.search)
  const orderId = propOrderId || queryParams.get('orderId') || undefined

  const handleBackToPOS = () => {
    if (onCreateNewOrder) {
      onCreateNewOrder()
    } else {
      navigate('/staff/pos')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #fef9c3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(30,58,138,0.10)',
          padding: '48px 32px',
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        <img
          src={SHIP}
          alt="Success"
          style={{ width: 120, marginBottom: 24 }}
        />
        <h1
          style={{
            color: '#1e40af',
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 8,
          }}
        >
          Đặt hàng thành công!
        </h1>
        <div style={{ color: '#475569', fontSize: 16, marginBottom: 16 }}>
          Đơn hàng của bạn đã được tạo thành công.
          <br />
          {orderId && (
            <span>
              Mã đơn hàng: <b style={{ color: '#d97706' }}>{orderId}</b>
            </span>
          )}
        </div>
        <Button
          type="primary"
          size="large"
          style={{
            background: '#1e40af',
            borderColor: '#1e40af',
            borderRadius: 8,
            fontWeight: 600,
            marginTop: 12,
            width: '100%',
          }}
          onClick={handleBackToPOS}
        >
          Tạo đơn mới
        </Button>
      </div>
    </div>
  )
}

export default POSSuccess
