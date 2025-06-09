/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layout, Menu, Button, Dropdown, Badge, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "../style/Navbar.css";
import { ShoppingCartOutlined, MenuOutlined } from "@ant-design/icons";
import APP_LOGO from "../assets/logo.png";
import BellIcon from "./icon/BellIcon";
import AccountIcon from "./icon/AccountIcon";
import { useState, useEffect, useRef } from "react";
import Cart from "./Cart";
import { useAuthStore } from "../hooks/usersApi";
import { useCartStore } from "../store/cart.store";

const { Header } = Layout;

const Navbar = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getCartItemsByUserId, clearCartForUser } = useCartStore();
  const cartRef = useRef<HTMLDivElement>(null);

  const userMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/user-information")}>
        Tài khoản
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => {
          logout();
          navigate("/login");
          message.success("Đăng xuất thành công");
        }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const handleCartClick = () => {
    setIsCartVisible(!isCartVisible);
  };

  const handleConfirmOrder = (selectedItems: any[]) => {
    navigate("/checkout", { state: { selectedItems } });
    setIsCartVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCartVisible &&
        cartRef.current &&
        !cartRef.current.contains(event.target as Node)
      ) {
        setIsCartVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartVisible]);

  useEffect(() => {
    if (!user?.id) {
      // Optionally clear the cart if no user is logged in
      // clearCartForUser(user?.id || ""); // Uncomment if you want to clear on logout
    }
  }, [user, clearCartForUser]);

  const cartItems = user?.id ? getCartItemsByUserId(user.id) : [];

  // const uniqueProductCount = new Set(cartItems.map((item) => item.productId))
  //   .size;
  const totalItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleMenuToggle = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Button
        type="text"
        icon={<MenuOutlined />}
        className="hamburger-menu"
        onClick={handleMenuToggle}
        style={{ color: "#d97706", fontSize: "24px", display: "none" }}
      />
      <div
        className={`header-brand ${isMenuVisible ? "active" : ""}`}
        style={{
          display: isMenuVisible || window.innerWidth >= 840 ? "" : "none",
        }}
      >
        <div className="header-logo">
          <img src={APP_LOGO} alt="Logo" />
        </div>
        <Menu mode="horizontal" className="header-menu">
          <Menu.Item key="1">
            <Link to="/">Về Tấm Tắc</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/menu">Menu</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/blog">Blog</Link>
          </Menu.Item>
          <Menu.Item key="6">
            <Link to="/cua-hang">Cửa Hàng</Link>
          </Menu.Item>
        </Menu>
        <div className="header-media">
          <Link to="/">Về Tấm Tắc</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/cua-hang">Cửa Hàng</Link>
        </div>
        <div className="header-icon">
          <Button
            type="text"
            icon={<BellIcon />}
            style={{ color: "#d97706", marginRight: "10px" }}
          />
          {user?.id ? (
            <Dropdown overlay={userMenu} trigger={["hover"]}>
              <Button
                type="text"
                icon={<AccountIcon />}
                style={{ color: "#d97706", marginRight: "10px" }}
              />
            </Dropdown>
          ) : (
            <Button
              type="text"
              icon={<AccountIcon />}
              style={{ color: "#d97706", marginRight: "10px" }}
              onClick={() => navigate("/login")}
            />
          )}
          <Badge count={totalItemCount} style={{ background: "#da7339" }}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={handleCartClick}
              style={{ color: "#d97706" }}
            />
          </Badge>
          {isCartVisible && (
            <div className="cart-dropdown" ref={cartRef}>
              <Cart cartItems={cartItems} onConfirmOrder={handleConfirmOrder} />
            </div>
          )}
        </div>
      </div>
      {/* <Input
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
      <div className="header-icon">
        <Button
          type="text"
          icon={<BellIcon />}
          style={{ color: "#d97706", marginRight: "10px" }}
        />
        <Dropdown overlay={userMenu} trigger={["hover"]}>
          <Button
            type="text"
            icon={<AccountIcon />}
            style={{ color: "#d97706", marginRight: "10px" }}
          />
        </Dropdown>
        <Button
          type="text"
          icon={<ShoppingCartOutlined />}
          onClick={handleCartClick}
          style={{ color: "#d97706" }}
        />
        {isCartVisible && (
          <div className="cart-dropdown">
            <Cart cartItems={cartItems} onConfirmOrder={handleConfirmOrder} />
          </div>
        )}
      </div> */}
    </Header>
  );
};

export default Navbar;
