import { Col } from "antd";
import "../style/PaymentSuccess.css";
import { Link, useLocation } from "react-router-dom";
import SHIP from "../assets/ship.png";

const PaymentSuccess = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderCode = queryParams.get("orderCode") || "N/A";

  return (
    <div className="payment-success-container">
      <Col>
        <div className="success-content">
          <h1 className="success-title">Thanh toán thành công</h1>
          <div className="scooter-image">
            <img src={SHIP} alt="Delivery Scooter" className="scooter-img" />
          </div>
          <p className="order-information">
            Đơn hàng được tạo lúc 13:46, 27/01/2025
            <br />
            Mã đơn hàng: {orderCode}
          </p>
          <p className="contact-text">
            Hãy chú ý điện thoại của bạn trong suốt quá trình giao hàng nhé!
          </p>
          <Link to="/history" className="track-link">
            Theo dõi đơn hàng
          </Link>
        </div>
      </Col>
    </div>
  );
};

export default PaymentSuccess;
