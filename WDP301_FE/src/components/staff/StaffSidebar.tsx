import { useState } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ShoppingFilled,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  DownOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./StaffSidebar.css";
import logo from "../../assets/logo-footer.png";
import { useAuthStore } from "../../hooks/usersApi";

const { Header, Sider, Content } = Layout;

const StaffSidebarBlueStyles = () => (
  <style>{`
    /* Nút menu đóng/mở sidebar */
    .staff-sidebar-toggle-btn {
      color: #60A5FA !important;
    }
    .staff-sidebar-toggle-btn:hover {
      color: #3B82F6 !important;
    }
    /* Placeholder input tìm kiếm */
    input[placeholder="Tìm kiếm..."] {
      color: #3B82F6 !important;
    }
    input[placeholder="Tìm kiếm..."]::placeholder {
      color: #3B82F6 !important;
      opacity: 1;
    }
    .admin-bell-btn {
      color: #60A5FA !important;
      transition: color 0.2s;
    }
    .admin-bell-btn:hover {
      color: #3B82F6 !important;
      transition: color 0.2s;
    }
  `}</style>
);

const StaffSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const siderWidth = 250;
  const siderCollapsedWidth = 80;

  const menuItems = [
    {
      key: "orders",
      icon: <ShoppingFilled />,
      label: "Quản lý đơn hàng",
      children: [
        {
          key: "/staff/orders",
          icon: <EyeOutlined />,
          label: "Xem đơn hàng",
        },
        {
          key: "/staff/orders/confirm-orders",
          icon: <CheckCircleOutlined />,
          label: "Xác nhận đơn",
        },
      ],
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: () => {
        navigate("/staff/profile");
      },
    },
    {
      key: "settingsMenu",
      label: "Cài đặt",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate("/login");
        message.success("Đăng xuất thành công");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebarBlueStyles />
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={siderWidth}
        collapsedWidth={siderCollapsedWidth}
        style={{
          backgroundColor: "#1E3A8A",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          overflowY: "auto",
        }}
        className="staff-sidebar"
      >
        <div
          className="logo"
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderBottom: "1px solid #3B82F6",
            marginBottom: "8px",
            background: "#1E3A8A",
            width: "100%",
          }}
        >
          <h2
            style={{
              color: "#fff",
              margin: 0,
              fontSize: collapsed ? "20px" : "24px",
              fontWeight: "bold",
              transition: "all 0.3s",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "60px",
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                maxHeight: "100%",
                maxWidth: collapsed ? "90%" : "70%",
                objectFit: "contain",
                transition: "all 0.3s",
              }}
            />
          </h2>
        </div>
        <Menu
          className="admin-menu"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["stores"]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{
            borderRight: 0,
            backgroundColor: "#1E3A8A",
          }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? siderCollapsedWidth : siderWidth,
          transition: "margin-left 0.2s",
          minHeight: "100vh",
        }}
      >
        <Header
          style={{
            background: "#E0E7FF",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #3B82F6",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 999,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="staff-sidebar-toggle-btn"
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              outline: "none",
              border: "none",
              background: "transparent",
              position: "absolute",
              left: collapsed ? "-10px" : "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <Button
              type="text"
              icon={<BellOutlined className="admin-bell-btn" />}
              style={{
                fontSize: "18px",
                color: "#60A5FA",
                width: 40,
                height: 40,
                outline: "none",
                boxShadow: "none",
                border: "none",
                background: "transparent",
              }}
            />

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  transition: "all 0.3s",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3B82F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#1E40AF",
                    color: "#fff",
                  }}
                />
                <span style={{ color: "#1E40AF", fontWeight: 600 }}>
                  {user?.fullName}
                </span>
                <DownOutlined style={{ color: "#1E40AF" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#E0E7FF",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffSidebar;
