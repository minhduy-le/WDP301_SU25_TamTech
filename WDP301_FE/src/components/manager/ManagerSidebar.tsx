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
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const ManagerSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/manager/dashboard",
      icon: <BarChartOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/manager/orders",
      icon: <ShoppingCartOutlined />,
      label: "Quản lý đơn hàng",
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
          backgroundColor: "#fff",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
        className="aside-sidebar"
      >
        <div
          className="logo"
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: "8px",
          }}
        >
          <h2
            style={{
              color: "#f97316",
              margin: 0,
              fontSize: collapsed ? "20px" : "24px",
              fontWeight: "bold",
              transition: "all 0.3s",
            }}
          >
            {collapsed ? "MP" : "Manager Panel"}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{
            height: "100%",
            borderRight: 0,
            backgroundColor: "transparent",
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
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
              color: "#f97316",
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
              prefix={<SearchOutlined />}
              style={{
                width: 200,
                borderRadius: "20px",
              }}
            />

            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                fontSize: "18px",
                color: "#f97316",
                width: 40,
                height: 40,
                outline: "none",
                boxShadow: "none",
                border: "none",
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
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#f97316",
                  }}
                />
                <span style={{ color: "#666" }}>Admin</span>
                <DownOutlined style={{ color: "#666" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: 24,
            background: "#fff",
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
