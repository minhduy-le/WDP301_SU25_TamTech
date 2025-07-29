import { Col } from "antd";
import "../style/PaymentSuccess.css";
import { useLocation, useNavigate } from "react-router-dom";
import SHIP from "../assets/ship.png";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId") || "N/A";

  const handleTrackOrder = () => {
    navigate(`/user/order-tracking/${orderId}`);
  };

  return (
    <div className="payment-success-container">
      <Col>
        <div className="success-content">
          <h1 className="success-title">Thanh toán thành công</h1>
          <div className="scooter-image">
            <img src={SHIP} alt="Delivery Scooter" className="scooter-img" />
          </div>
          <p className="order-information">
            {/* Đơn hàng được tạo lúc 13:46, 27/01/2025 */}
            <br />
            Mã đơn hàng: {orderId}
          </p>
          <p className="contact-text">
            Hãy chú ý điện thoại của bạn trong suốt quá trình giao hàng nhé!
          </p>
          <button onClick={handleTrackOrder} className="track-link">
            Theo dõi đơn hàng
          </button>
        </div>
      </Col>
    </div>
  );
};

export default PaymentSuccess;
