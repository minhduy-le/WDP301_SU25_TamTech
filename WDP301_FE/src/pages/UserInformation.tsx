import { Layout, Menu } from "antd";
import "../style/UserInformation.css";
import { useState } from "react";
import OrderTracking from "./OrderTracking";

const { Sider, Content } = Layout;

const UserInfomation = () => {
  const [activePage, setActivePage] = useState("1");

  const handleMenuClick = (e: { key: string }) => {
    setActivePage(e.key);
  };

  return (
    <div className="user-info-container">
      <Layout style={{ minHeight: "510px", background: "#fff7e6" }}>
        <Sider width={300} className="user-sider">
          <div className="user-details">
            <p className="user-name">Dummy Tester VietNamese</p>
            <p className="user-email">0902346789</p>
            <p className="user-email">dummytestervietnamese@gmail.com</p>
            <Menu
              mode="vertical"
              className="sidebar-menu"
              selectedKeys={[activePage]}
              onClick={handleMenuClick}
            >
              <Menu.Item key="1" className="menu-item active">
                <span role="img" aria-label="profile">
                  👤
                </span>{" "}
                Thông tin thành viên
              </Menu.Item>
              <Menu.Item key="2" className="menu-item">
                <span role="img" aria-label="order">
                  🔍
                </span>{" "}
                Tra cứu đơn hàng
              </Menu.Item>
              <Menu.Item key="3" className="menu-item">
                <span role="img" aria-label="history">
                  ⏳
                </span>{" "}
                Lịch sử mua hàng
              </Menu.Item>
              <Menu.Item key="4" className="menu-item">
                <span role="img" aria-label="address">
                  📍
                </span>{" "}
                Ưu đãi
              </Menu.Item>
              <Menu.Item key="5" className="menu-item">
                <span role="img" aria-label="home">
                  🏠
                </span>{" "}
                Địa chỉ giao hàng
              </Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout
          style={{ padding: "0 20px", background: "#fff7e6", borderRadius: 10 }}
        >
          <Content>
            {activePage === "1" && (
              <div className="content-col">
                <div className="content-header">Thông tin thành viên</div>
                <div className="qr-code-section">
                  <img
                    src="https://via.placeholder.com/150x150"
                    alt="QR Code"
                    className="qr-code"
                  />
                  <div className="qr-text">
                    <p>0902346789</p>
                    <p>
                      <strong>Hạng thành viên:</strong> Vàng
                    </p>
                    <p>
                      <strong>Điểm tích lũy:</strong> 100 điểm
                    </p>
                    <p>
                      <strong>Điểm đã sử dụng:</strong> 0 điểm
                    </p>
                    <p>
                      <strong>Điểm còn lại:</strong> 100 điểm
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activePage === "2" && <OrderTracking />}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default UserInfomation;
