import { Col, message } from "antd";
import "../style/PaymentSuccess.css";
import { useLocation, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import TomatoError from "./Tomato Error.json";
import { usePOSApi } from "../hooks/posApi";
import { useEffect, useState } from "react";

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId") || "N/A";
  const { cancelOrder } = usePOSApi();
  const [hasCalled, setHasCalled] = useState(false);

  useEffect(() => {
    const handleCancelOrder = async () => {
      if (orderId !== "N/A" && !hasCalled) {
        try {
          const parsedOrderId = parseInt(orderId, 10);
          await cancelOrder(parsedOrderId);
          setHasCalled(true);
          message.success("Đã hủy đơn hàng thành công");
        } catch (error: any) {
          message.error(
            "Có lỗi xảy ra khi hủy đơn hàng: " +
              (error.message || "Lỗi không xác định")
          );
        }
      } else if (orderId === "N/A") {
        message.error("Không tìm thấy mã đơn hàng.");
      }
    };

    handleCancelOrder();
  }, [cancelOrder, orderId, hasCalled]);

  const handleBackToOrders = () => {
    navigate(`/staff/pos`);
  };

  return (
    <div
      className="payment-success-container"
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Col>
        <div className="success-content" style={{ paddingTop: "30px" }}>
          <h1
            className="success-title"
            style={{ color: "#991B1B", marginBottom: "30px" }}
          >
           Đã Hủy Thanh Toán
          </h1>
          <div className="scooter-image" style={{ marginBottom: 30 }}>
            <Lottie
              animationData={TomatoError}
              style={{ width: 190, height: 190, margin: "0 auto" }}
              loop={true}
            />
          </div>
          <p
            className="order-information"
            style={{ color: "#991B1B", fontSize: "18px" }}
          >
            Đã hủy thanh toán đơn hàng.
            <br />
            Mã đơn hàng: {orderId}
          </p>
          <button
            onClick={handleBackToOrders}
            className="track-link"
            style={{ color: "#991B1B" }}
          >
            Quay lại trang POS
          </button>
        </div>
      </Col>
    </div>
  );
};

export default PaymentCancel;
