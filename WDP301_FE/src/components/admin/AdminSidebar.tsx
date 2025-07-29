import React from "react";
import { Layout, Avatar, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  
} from "@ant-design/icons";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../hooks/usersApi";

const { Header, Content } = Layout;

const AdminSidebarGreenStyles = () => (
  <style>{`
    /* Nút menu đóng/mở sidebar */
    .admin-sidebar-toggle-btn {
      color: #4CAF50 !important;
    }
    .admin-sidebar-toggle-btn:hover {
      color: #2e7d32 !important;
    }
    /* Placeholder input tìm kiếm */
    input[placeholder="Tìm kiếm..."] {
      color: #2e7d32 !important;
    }
    input[placeholder="Tìm kiếm..."]::placeholder {
      color: #2e7d32 !important;
      opacity: 1;
    }
       .admin-bell-btn {
      color:rgb(26, 96, 28) !important;
      transition: color 0.2s;
    }
    .admin-bell-btn:hover {
      color: #2e7d32 !important;
      transition: color 0.2s;
    }
      .ant-layout-header {
  background-color: #2e7d32 !important;
}

/* Specific admin header styling */
.admin-header {
  background-color: #2e7d32 !important;
}

/* Even more specific selector */
.ant-layout .ant-layout-header.admin-header {
  background-color: #2e7d32 !important;
  `}</style>
);

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthStore();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: () => {
        navigate("/admin/profile");
      },
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
        message.success("Đăng xuất thành công");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebarGreenStyles />
        <Header
          className="admin-header"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #4CAF50",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 999,
          }}
        >
          <h2 style={{ color: "#fff7e6", fontWeight: 'bold', marginLeft: 20, fontSize: 30 }}>QUẢN LÝ NGƯỜI DÙNG</h2>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >

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
                  e.currentTarget.style.backgroundColor = "#4CAF50";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#E8F5E9",
                    color: "#2e7d32",
                  }}
                />
                <span style={{ color: "#e8f5e9", fontWeight: 600 }}>
                  {authUser?.fullName}
                </span>
                <DownOutlined style={{ color: "#e8f5e9" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#E8F5E9",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
  );
};

export default AdminSidebar;
