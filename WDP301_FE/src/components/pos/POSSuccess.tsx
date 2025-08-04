import React from 'react'
import { Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import SHIP from '../../assets/ship.png'

interface PaymentStatus {
  orderId?: string
  code?: string
  status?: string
  invoiceUrl?: string
}

const POSSuccess: React.FC<{
  orderId?: string
  onCreateNewOrder?: () => void
}> = ({ orderId: propOrderId, onCreateNewOrder }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  
  const paymentData: PaymentStatus = {
    orderId: propOrderId || queryParams.get('orderId') || undefined,
    code: queryParams.get('code') || undefined,
    status: queryParams.get('status') || undefined,
    invoiceUrl: queryParams.get('invoiceUrl') || undefined,
  }
  
  const orderId = paymentData.orderId

  const handleBackToPOS = () => {
    if (onCreateNewOrder) {
      onCreateNewOrder()
    } else {
      navigate('/staff/pos')
    }
  }

  const isPaymentSuccess = paymentData.status === 'PAID' && paymentData.code === '00'

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
            color: isPaymentSuccess ? '#059669' : '#1e40af',
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 8,
          }}
        >
          {isPaymentSuccess ? 'Thanh toán thành công!' : 'Đặt hàng thành công!'}
        </h1>
        <div style={{ color: '#475569', fontSize: 16, marginBottom: 16 }}>
          {isPaymentSuccess 
            ? 'Đơn hàng của bạn đã được thanh toán thành công.'
            : 'Đơn hàng của bạn đã được tạo thành công.'
          }
          <br />
          {orderId && (
            <span>
              Mã đơn hàng: <b style={{ color: '#d97706' }}>{orderId}</b>
            </span>
          )}
          {paymentData.code && (
            <div style={{ marginTop: 8 }}>
              Mã giao dịch: <b style={{ color: '#059669' }}>{paymentData.code}</b>
            </div>
          )}
          {paymentData.status && (
            <div style={{ marginTop: 4, fontSize: 14 }}>
              Trạng thái: <b style={{ color: isPaymentSuccess ? '#059669' : '#d97706' }}>
                {paymentData.status}
              </b>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {paymentData.invoiceUrl && (
            <Button
              type="default"
              size="large"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                flex: 1,
              }}
              onClick={() => window.open(paymentData.invoiceUrl, '_blank')}
            >
              Xem hóa đơn
            </Button>
          )}
          <Button
            type="primary"
            size="large"
            style={{
              background: '#1e40af',
              borderColor: '#1e40af',
              borderRadius: 8,
              fontWeight: 600,
              flex: 1,
            }}
            onClick={handleBackToPOS}
          >
            Tạo đơn mới
          </Button>
        </div>
      </div>
    </div>
  )
}

export default POSSuccess
