import { Layout, Menu, Input, Button } from "antd";
import { Outlet, Link } from "react-router-dom";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import "../style/Sidebar.css";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

const Sidebar = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={64}
        style={{
          background: "#f97316",
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <img
            src="https://via.placeholder.com/40"
            alt="Logo"
            style={{ width: "40px", height: "40px" }}
          />
        </div>
        <Menu
          mode="vertical"
          theme="light"
          defaultSelectedKeys={["1"]}
          style={{ width: "100%", background: "#f97316", border: "none" }}
        >
          <Menu.Item key="1" icon={<MenuOutlined style={{ color: "#fff" }} />}>
            <Link to="/dashboard" style={{ color: "#fff" }}>
              Dashboard
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff7e6",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1 }}>
            <Search
              placeholder="Tìm kiếm..."
              style={{ width: "200px", borderRadius: "5px" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={<BellOutlined style={{ color: "#d97706" }} />}
              style={{ marginRight: "10px" }}
            />
            <Button
              type="text"
              icon={<UserOutlined style={{ color: "#d97706" }} />}
              style={{ marginRight: "10px" }}
            />
            <Button
              type="text"
              icon={<SettingOutlined style={{ color: "#d97706" }} />}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff7e6",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
