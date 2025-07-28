import { Col } from "antd";
import "../style/PaymentSuccess.css";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import TomatoError from "./Tomato Error.json";

const CancelOrderSuccess = () => {
  const navigate = useNavigate();

  const handleBackToOrders = () => {
    navigate("/user-information", {
      state: {
        activeTab: "3",
        showOrderTracking: true,
      },
    });
  };

  return (
    <div className="payment-success-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Col>
        <div className="success-content" style={{ paddingTop: '30px' }}>
          <h1 className="success-title" style={{ color: '#991B1B', marginBottom: '30px' }}>Đã hủy đơn hàng thành công!</h1>
          <div className="scooter-image" style={{ marginBottom: 30 }}>
            <Lottie animationData={TomatoError} style={{ width: 190, height: 190, margin: '0 auto' }} loop={true} />
          </div>
          <p className="order-information" style={{ color: '#991B1B', fontSize: '18px'}}>
            Đơn hàng của bạn đã được hủy thành công.<br />
          </p>
          <button onClick={handleBackToOrders} className="track-link" style={{ color: '#991B1B' }}>
            Quay về đơn hàng của tôi
          </button>
        </div>
      </Col>
    </div>
  );
};

export default CancelOrderSuccess; 