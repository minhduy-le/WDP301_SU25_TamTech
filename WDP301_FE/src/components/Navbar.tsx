import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import "../style/Navbar.css";

const { Header } = Layout;

const Navbar = () => {
  return (
    <Header className="navbar">
      <div className="navbar-logo">
        <div className="logo-placeholder">
          <span className="logo-text">TÂM TÂM</span>
          <span className="logo-subtext">TÂM TÂM (WEB)</span>
        </div>
      </div>
      <Menu
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        className="navbar-menu"
      >
        <Menu.Item key="1">
          <Link to="/">Về Tâm Tâm</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/order">Đặt Hàng</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/psychology-test">Thước đo tinh tật</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/story">Chuyện Côn Tâm</Link>
        </Menu.Item>
        <Menu.Item key="5">
          <Link to="/privileges">Nhuộng Quyền</Link>
        </Menu.Item>
        <Menu.Item key="6">
          <Link to="/stores">Cửa Hàng</Link>
        </Menu.Item>
        {/* Placeholder cho phần tìm kiếm và icons */}
        <Menu.Item key="7" disabled className="navbar-actions">
          {/* Để trống cho bạn thêm icon tìm kiếm */}
          <div className="search-placeholder" />
          {/* Để trống cho bạn thêm icon thông báo */}
          <div className="notification-placeholder" />
          {/* Để trống cho bạn thêm icon tài khoản */}
          <div className="account-placeholder" />
          {/* Để trống cho bạn thêm icon giỏ hàng */}
          <div className="cart-placeholder" />
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default Navbar;
