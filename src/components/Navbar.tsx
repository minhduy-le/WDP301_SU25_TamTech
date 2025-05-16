import { Layout, Menu, Button } from "antd";
import { Link } from "react-router-dom";
import "../style/Navbar.css";
import { ShoppingCartOutlined } from "@ant-design/icons";
import APP_LOGO from "../assets/logo.png";
import BellIcon from "./icon/BellIcon";
import AccountIcon from "./icon/AccountIcon";

const { Header } = Layout;

const Navbar = () => {
  return (
    <Header>
      <div className="header-logo">
        <img src={APP_LOGO} alt="Logo" />
      </div>
      <Menu mode="horizontal" className="header-menu">
        <Menu.Item key="1">
          <Link to="/ve-tam-tac">Về Tâm Tác</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/dat-hang">Đặt Hàng</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/thuc-don-ai">Thực đơn từ AI</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/chuyen-com-tam">Chuyện Cơm Tâm</Link>
        </Menu.Item>
        <Menu.Item key="5">
          <Link to="/nhuong-quyen">Nhượng Quyền</Link>
        </Menu.Item>
        <Menu.Item key="6">
          <Link to="/cua-hang">Cửa Hàng</Link>
        </Menu.Item>
      </Menu>
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
          style={{ color: "#d97706" }}
        />
      </div>
    </Header>
  );
};

export default Navbar;
