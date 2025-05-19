import { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, Button, Modal, Input } from "antd";
import { Link, useLocation, Outlet } from "react-router-dom";
import "../style/Sidebar.css";
import BellSidebarIcon from "./icon/BellSidebarIcon";
import SettingIcon from "./icon/SettingIcon";
import MessageIcon from "./icon/MessageIcon";
import UserIcon from "./icon/UserIcon";
import APP_LOGO_SIDEBAR from "../assets/logo-sidebar.png";
import HomeIcon from "./icon/HomeIcon";
import LinkIcon from "./icon/LinkIcon";
import UserSidebarIcon from "./icon/UserSidebarIcon";
import StoreIcon from "./icon/StoreIcon";
import CookIcon from "./icon/CookIcon";

const { Header, Content, Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const items2 = [
    {
      key: "Dashboard",
      icon: <img src={APP_LOGO_SIDEBAR} />,
    },
    {
      key: "Dashboard",
      icon: <HomeIcon />,
      label: <Link to="/dashboard">Trang chủ</Link>,
    },
    {
      key: "Món ăn",
      icon: <LinkIcon />,
      label: <Link to="/rice">Quản lý món ăn</Link>,
    },
    {
      key: "Người dùng",
      icon: <UserSidebarIcon />,
      label: <Link to="/user">Quản lý người dùng</Link>,
    },
    {
      key: "Đơn hàng",
      icon: <StoreIcon />,
      label: <Link to="/order">Quản lý đơn hàng</Link>,
    },
    {
      key: "Khuyến mãi",
      icon: <CookIcon />,
      label: <Link to="/promotion">Quản lý khuyến mãi</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="aside-sidebar"
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items2}
          className="bg-light-109 header-menu-sidebar"
        />
      </Sider>

      <Layout>
        <Header className="header-sidebar">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="header-hamburger"
          />

          <div className="header-function">
            <Input
              placeholder="Tìm kiếm tác vụ..."
              suffix={<SearchOutlined />}
              className="search-input"
            />

            <Button
              shape="circle"
              icon={<BellSidebarIcon />}
              className="icon-shape-sidebar"
            />

            <Button
              shape="circle"
              icon={<MessageIcon />}
              className="icon-shape-sidebar"
            />

            <Button
              shape="circle"
              icon={<SettingIcon />}
              className="icon-shape-sidebar"
            />

            <Button
              shape="circle"
              icon={<UserIcon />}
              className="icon-shape-sidebar"
            />
          </div>
        </Header>

        <Layout className={"home-background"}>
          <Breadcrumb></Breadcrumb>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <Modal
        title="Quy định nhập liệu"
        open={isModalOpen}
        footer={null}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p></p>
      </Modal>
    </Layout>
  );
};

export default Sidebar;
