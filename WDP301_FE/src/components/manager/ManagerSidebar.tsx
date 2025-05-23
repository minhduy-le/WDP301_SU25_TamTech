import React, { useState } from "react";
import { Layout, Menu, Button, Input, Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  DownOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  PrinterOutlined,
  FilterOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./ManagerSidebar.css";

const { Header, Sider, Content } = Layout;

const ManagerSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "manager/dashboard",
      icon: <BarChartOutlined />,
      label: "Tổng quan",
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Quản lý đơn hàng",
      children: [
        {
          key: "/manager/orders",
          icon: <EyeOutlined />,
          label: "Xem đơn hàng",
        },
        {
          key: "/manager/orders/confirm-orders",
          icon: <CheckCircleOutlined />,
          label: "Xác nhận đơn",
        }
      ],
    },
    {
      key: "/manager/customers",
      icon: <UserOutlined />,
      label: "Quản lý khách hàng",
    },
    {
      key: "/manager/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
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
      onClick: () => navigate("/login"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          backgroundColor: "#D97B41",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
        className="aside-sidebar"
      >
        <div
          className="logo"
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderBottom: "1px solid #E9C97B",
            marginBottom: "8px",
            background: "#D97B41",
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
            }}
          >
            {collapsed ? "MP" : "Manager Panel"}
          </h2>
        </div>
        <Menu
          className="manager-menu"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["orders", "revenue"]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{
            height: "100%",
            borderRight: 0,
            backgroundColor: "#D97B41",
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#FFF3D6",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #E9C97B",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "#D97B41",
              outline: "none",
              border: "none",
              background: "transparent",
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
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined style={{ color: '#A05A2C' }} />}
              style={{
                width: 200,
                borderRadius: "20px",
                background: "#F9E4B7",
                color: "#A05A2C",
                border: "1px solid #E9C97B",
              }}
            />

            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                fontSize: "18px",
                color: "#D97B41",
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
                  e.currentTarget.style.backgroundColor = "#E9C97B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#A05A2C",
                    color: "#fff",
                  }}
                />
                <span style={{ color: "#A05A2C", fontWeight: 600 }}>Admin</span>
                <DownOutlined style={{ color: "#A05A2C" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#FFF3D6",
            minHeight: 280,
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerSidebar;