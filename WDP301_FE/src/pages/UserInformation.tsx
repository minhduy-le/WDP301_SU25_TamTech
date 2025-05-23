import { Layout, Menu } from "antd";
import "../style/UserInformation.css";
import { useEffect, useState } from "react";
import OrderTracking from "./OrderTracking";
import OrderHistory from "./OrderHistory";
import UserBoldIcon from "../components/icon/UserBoldIcon";
import { ContainerOutlined } from "@ant-design/icons";
import SearchIcon from "../components/icon/SearchIcon";
import PromotionIcon from "../components/icon/PromotionIcon";
import HomeSideIcon from "../components/icon/HomeSideIcon";
import AddressOrder from "./AdressOrder";
import Promotion from "./Promotion";
import { useLocation, useNavigationType } from "react-router-dom";

const { Sider, Content } = Layout;

const UserInfomation = () => {
  const [activePage, setActivePage] = useState("1");
  const location = useLocation();
  const navigationType = useNavigationType();

  const handleMenuClick = (e: { key: string }) => {
    setActivePage(e.key);
    localStorage.setItem("userInfoActiveTab", e.key);
  };

  useEffect(() => {
    const savedTab = localStorage.getItem("userInfoActiveTab");

    if (location.pathname === "/user-information") {
      if (navigationType === "PUSH") {
        setActivePage("1");
        localStorage.setItem("userInfoActiveTab", "1");
      } else if (savedTab) {
        setActivePage(savedTab);
      } else {
        setActivePage("1");
        localStorage.setItem("userInfoActiveTab", "1");
      }
    }
  }, [location.pathname, navigationType]);
  // useEffect(() => {
  //   const savedTab = localStorage.getItem("userInfoActiveTab");
  //   if (savedTab && location.pathname === "/user-information") {
  //     setActivePage(savedTab);
  //   } else {
  //     setActivePage("1");
  //     localStorage.setItem("userInfoActiveTab", "1");
  //   }
  // }, [location.pathname]);

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
              <Menu.Item key="1" className="menu-item">
                <span role="img" aria-label="profile">
                  <UserBoldIcon />
                </span>
                Thông tin thành viên
              </Menu.Item>
              <Menu.Item key="2" className="menu-item">
                <span role="img" aria-label="order">
                  <SearchIcon />
                </span>
                Tra cứu đơn hàng
              </Menu.Item>
              <Menu.Item key="3" className="menu-item">
                <span role="img" aria-label="history">
                  <ContainerOutlined
                    style={{ fontSize: 20, color: "#2D1E1A" }}
                  />
                </span>
                Lịch sử mua hàng
              </Menu.Item>
              <Menu.Item key="4" className="menu-item">
                <span role="img" aria-label="address">
                  <PromotionIcon />
                </span>
                Ưu đãi
              </Menu.Item>
              <Menu.Item key="5" className="menu-item">
                <span role="img" aria-label="home">
                  <HomeSideIcon />
                </span>
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
            {activePage === "3" && <OrderHistory />}
            {activePage === "4" && <Promotion />}
            {activePage === "5" && <AddressOrder />}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default UserInfomation;
