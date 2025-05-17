import { Input, Button } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="login-container">
      <div className="image-section">
        <img src={APP_LOGIN} alt="Food" className="food-image" />
      </div>
      <div className="form-section">
        <div className="form-content">
          <h1 className="title">
            Tấm <span className="login-brown">ngon, </span>{" "}
            <span className="login-green">Tắc </span>
            <span className="login-brown">nhớ!</span>
          </h1>
          <p className="subtitle">
            Thương hiệu cơm tấm hàng đầu dành cho sinh viên.
          </p>
          <Input placeholder="Tài khoản" className="input-field" />
          <Input placeholder="Mật khẩu" className="input-field" />
          <Button className="login-button">Đăng nhập</Button>
          <div className="divider">
            <span className="divider-text">
              <Link to="/register">Bạn là người mới của Tấm Tắc?</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
