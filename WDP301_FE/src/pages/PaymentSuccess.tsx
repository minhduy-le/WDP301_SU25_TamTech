import { Col } from "antd";
import "../style/PaymentSuccess.css";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="payment-success-container">
      <Col>
        <div className="success-content">
          <h1 className="success-title">Thanh toán thành công</h1>
          <div className="scooter-image">
            <img
              src="https://via.placeholder.com/200x150"
              alt="Delivery Scooter"
              className="scooter-img"
            />
          </div>
          <p className="order-details">
            Đơn hàng được tạo lúc 13:46, 27/01/2025
            <br />
            Mã đơn hàng: 2501270005
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
