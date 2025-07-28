/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, message } from "antd";
import "../style/PaymentSuccess.css";
import { useLocation, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import TomatoError from "./Tomato Error.json";
import { useCancelOrderPayment } from "../hooks/ordersApi";
import { useEffect, useState } from "react";

const CancelOrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId") || "N/A";
  const { mutate: cancelOrder } = useCancelOrderPayment();
  const [hasCalled, setHasCalled] = useState(false);

  useEffect(() => {
    if (orderId !== "N/A" && !hasCalled) {
      const parsedOrderId = parseInt(orderId, 10);
      cancelOrder(
        { orderId: parsedOrderId },
        {
          onSuccess: () => {
            setHasCalled(true);
          },
          onError: (error: any) => {
            message.error(
              "Có lỗi xảy ra khi hủy đơn hàng: " +
                (error.message || "Lỗi không xác định")
            );
          },
        }
      );
    } else if (orderId === "N/A") {
      message.error("Không tìm thấy mã đơn hàng.");
    }
  }, [cancelOrder, orderId, hasCalled]);

  const handleBackToOrders = () => {
    navigate("/user-information", {
      state: {
        activeTab: "3",
        showOrderTracking: true,
        orderId: orderId,
      },
    });
  };

  return (
    <div
      className="payment-success-container"
      style={{
        minHeight: "80vh",
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
            Thanh toán thất bại
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
            Đơn hàng của bạn đã được hủy.
            <br />
            Mã đơn hàng: {orderId}
          </p>
          <button
            onClick={handleBackToOrders}
            className="track-link"
            style={{ color: "#991B1B" }}
          >
            Theo dõi đơn hàng
          </button>
        </div>
      </Col>
    </div>
  );
};

export default CancelOrderSuccess;
