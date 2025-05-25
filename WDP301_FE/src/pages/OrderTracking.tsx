import { Row, Col, Button, Steps, Divider } from "antd";
import "../style/OrderTracking.css";
import { useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import {
  ShoppingOutlined,
  BookOutlined,
  CarOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const items = [
  {
    title: "Đặt hàng thành công",
  },
  {
    title: "Đang chuẩn bị",
  },
  {
    title: "Đang vận chuyển",
  },
  {
    title: "Hoàn thành",
  },
  {
    title: "Đã hủy",
  },
];

const OrderTracking = () => {
  useEffect(() => {
    const stepIcons = document.querySelectorAll(".ant-steps-item-icon");
    const icons = [
      <ShoppingOutlined key="shop" />,
      <BookOutlined key="prep" />,
      <CarOutlined key="ship" />,
      <BookOutlined key="done" />,
      <DeleteOutlined key="cancel" />,
    ];

    stepIcons.forEach((icon, index) => {
      if (!icon.parentElement?.querySelector(".menu-icon")) {
        const menuIconDiv = document.createElement("div");
        menuIconDiv.className = "menu-icon";
        menuIconDiv.innerHTML = ReactDOMServer.renderToString(icons[index]);
        icon.parentElement?.insertBefore(menuIconDiv, icon);
      } else {
        const existingIcon = icon.parentElement?.querySelector(".menu-icon");
        if (existingIcon && !existingIcon.innerHTML) {
          existingIcon.innerHTML = ReactDOMServer.renderToString(icons[index]);
        }
      }
    });
  }, []);
  // useEffect(() => {
  //   const stepIcons = document.querySelectorAll(".ant-steps-item-icon");
  //   const icons = ["✓", "●", "🚚", "📝", "💰"]; // Array of icons in order

  //   stepIcons.forEach((icon, index) => {
  //     if (!icon.parentElement?.querySelector(".menu-icon")) {
  //       const menuIconDiv = document.createElement("div");
  //       menuIconDiv.className = "menu-icon";
  //       menuIconDiv.textContent = icons[index]; // Assign the corresponding icon
  //       icon.parentElement?.insertBefore(menuIconDiv, icon);
  //     } else {
  //       const existingIcon = icon.parentElement?.querySelector(".menu-icon");
  //       if (existingIcon && !existingIcon.textContent) {
  //         existingIcon.textContent = icons[index];
  //       }
  //     }
  //   });
  // }, []);

  return (
    <div className="order-tracking-container">
      <Row gutter={[16, 16]}>
        <Col span={24} className="content-col">
          <div className="order-header">Tra cứu đơn hàng</div>
          <div className="order-details">
            <p className="order-info">
              Mã đơn hàng: 2501230025
              <br />
              Thời gian đặt hàng: 16:49, 20/05/2025
            </p>
            <div className="tracking-timeline">
              <Steps current={1} labelPlacement="vertical" items={items} />
            </div>
            <div className="ship-status">
              Tình trạng đơn hàng:{" "}
              <div className="ship-status-bold"> Đang chuẩn bị</div>
            </div>
            <p className="shipping-info">
              <p className="item-title">Thông tin giao hàng</p>
              <br />
              <Row>
                <Col span={12} style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Tên khách hàng: Lê Minh Duy
                </Col>
                <Col span={12} style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Số điện thoại: 0911123456
                </Col>
              </Row>
              Địa chỉ giao hàng: 138 Hồ Văn Huế, Phường 9, Quận Phú Nhuận,
              TP.HCM
            </p>
            <div className="order-items">
              <p className="item-title">Thông tin đơn hàng</p>
              <div className="item-row">
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <span className="menu-main-item">COMBO - SÀ BÌ CHƯỞNG</span>
                  <span>Canh chua, nước ngọt: Coca Cola, cơm thêm</span>
                </Col>
                <span>
                  <strong style={{ color: "#DA7339" }}>134.000đ</strong> x1
                </span>
              </div>
              <div className="item-row">
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <span className="menu-main-item">COMBO - SÀ BÌ CHƯỞNG</span>
                  <span>
                    Canh chua, nước ngọt: Coca Cola, cơm thêm, rau chua thêm
                  </span>
                </Col>
                <span>
                  <strong style={{ color: "#DA7339" }}>138.000đ</strong> x1
                </span>
              </div>
              <div className="item-row">
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <span className="menu-main-item">CƠM SƯỜN CỌNG</span>
                  <span>Canh chua</span>
                  <span>Ghi chú: Lấy ít cơm</span>
                </Col>
                <span>
                  <strong style={{ color: "#DA7339" }}>85.000đ</strong> x2
                </span>
              </div>
              <div className="item-row">
                <span className="menu-main-item">Chả Trứng Hấp</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>12.000đ</strong> x1
                </span>
              </div>
              <div className="item-row">
                <span className="menu-main-item">Coca Cola</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>12.000đ</strong> x4
                </span>
              </div>
              <Divider
                style={{ border: "1px solid #2d1e1a", margin: "12px 0" }}
              />
              <div className="item-row">
                <span>Giá gốc</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>442.400đ</strong>
                </span>
              </div>
              <div className="item-row">
                <span>Giảm giá</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>86.250đ</strong>
                </span>
              </div>
              <div className="item-row">
                <span>Phí giao hàng</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>16.000đ</strong>
                </span>
              </div>
              <div className="item-row total">
                <span>TỔNG CỘNG</span>
                <span>372.150đ</span>
              </div>
            </div>
            <div className="button-group">
              <Button className="view-order">Hủy đơn</Button>
              <Button className="track-order">Theo dõi đơn hàng</Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OrderTracking;
