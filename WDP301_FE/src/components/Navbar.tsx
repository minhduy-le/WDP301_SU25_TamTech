import { Layout, Menu, Button, Input } from "antd";
import { Link } from "react-router-dom";
import "../style/Navbar.css";
import { ShoppingCartOutlined, SearchOutlined } from "@ant-design/icons";
import APP_LOGO from "../assets/logo.png";
import BellIcon from "./icon/BellIcon";
import AccountIcon from "./icon/AccountIcon";
import { useState } from "react";
import Cart from "./Cart";

const { Header } = Layout;

const Navbar = () => {
  const [isCartVisible, setIsCartVisible] = useState(false);

  const handleCartClick = () => {
    setIsCartVisible(!isCartVisible);
  };

  return (
    <Header>
      <div className="header-logo">
        <img src={APP_LOGO} alt="Logo" />
      </div>
      <Menu mode="horizontal" className="header-menu">
        <Menu.Item key="1">
          <Link to="/ve-tam-tac">Về Tấm Tác</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/dat-hang">Đặt Hàng</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/thuc-don-ai">Thực đơn từ AI</Link>
        </Menu.Item>
        <Menu.Item key="6">
          <Link to="/cua-hang">Cửa Hàng</Link>
        </Menu.Item>
      </Menu>
      <Input
        className="header-search"
        placeholder="Tìm kiếm món ăn, combo, cửa hàng..."
        prefix={<SearchOutlined style={{ color: "#da7339" }} />}
        style={{
          borderRadius: 20,
          background: "##fff7e6",
          border: "2px solid #da7339",
          width: 300,
          height: 40,
          margin: "0 24px",
          fontSize: 16,
          color: "#7c4a03",
        }}
      />
      <div className="header-icon">
        <Button
          type="text"
          icon={<BellIcon />}
          style={{ color: "#d97706", marginRight: "10px" }}
        />
        <Button
          type="text"
          icon={<AccountIcon />}
          style={{ color: "#d97706", marginRight: "10px" }}
        />
        <Button
          type="text"
          icon={<ShoppingCartOutlined />}
          onClick={handleCartClick}
          style={{ color: "#d97706" }}
        />
        {isCartVisible && (
          <div className="cart-dropdown">
            <Cart />
          </div>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
