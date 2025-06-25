/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Button, message, Form, Divider } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, type LoginDto } from "../hooks/usersApi";
import { useMutation } from "@tanstack/react-query";
import Role from "../enums/role.enum";
import GoogleIcon from "../components/icon/GoogleIcon";

const Login = () => {
  const [loginForm] = Form.useForm();
  const { login, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation<
    { success: boolean; message: string; role: string },
    unknown,
    LoginDto
  >({
    mutationFn: login,
    onSuccess: (response) => {
      if (response.success) {
        if (response.role === Role.ADMIN) {
          navigate("/admin/users");
        } else if (response.role === Role.MANAGER) {
          navigate("/manager/dashboard");
        } else if (response.role === Role.STAFF) {
          navigate("/staff/orders");
        } else {
          navigate("/");
        }
        message.success("Đăng nhập thành công");
      } else {
        message.error(response.message);
      }
    },
    onError: (error) => {
      const errorMessage = (error as { responseValue: string }).responseValue;
      // message.error(errorMessage);
      if (errorMessage === "Account not activated") {
        message.error("Tài khoản chưa được kích hoạt");
      } else if (errorMessage === "Account is banned") {
        message.error("Tài khoản đã bị cấm");
      } else if (errorMessage === "Invalid credentials") {
        message.error("Sai mật khẩu");
      } else if (errorMessage === "Password must be at least 6 characters") {
        message.error("Mật khẩu phải có ít nhất 6 ký tự");
      } else if (errorMessage === "User not found") {
        message.error("Không tìm thấy người dùng");
      } else {
        message.error(errorMessage);
      }
    },
  });

  const googleLoginMutation = useMutation<
    { success: boolean; message: string; role: string },
    unknown,
    void
  >({
    mutationFn: googleLogin,
    onSuccess: (response) => {
      if (response.success) {
        navigate("/");
        message.success("Đăng nhập bằng Google thành công");
      } else {
        message.error(response.message);
      }
    },
    onError: (error) => {
      const errorMessage = (error as { responseValue: string }).responseValue;
      // message.error(errorMessage);
      if (errorMessage === "Invalid email from Google token") {
        message.error("Email không hợp lệ từ token Google");
      } else if (errorMessage === "Account is banned") {
        message.error("Tài khoản đã bị cấm");
      } else if (errorMessage === "Invalid Google token") {
        message.error("Token Google không hợp lệ");
      } else if (
        errorMessage === "Network error: Unable to connect to Firebase"
      ) {
        message.error("Lỗi mạng: Không thể kết nối đến Firebase");
      } else {
        message.error("Lỗi đăng nhập bằng Google");
      }
    },
  });

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate();
  };

  const onFinish = (values: any) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="login-container">
      <div className="image-section">
        <img src={APP_LOGIN} alt="Food" className="food-image" />
      </div>
      <div className="form-section">
        <div
          className="form-content"
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "0 auto",
            width: "max-content",
            padding: "0 20px",
          }}
        >
          <h1 className="title">
            Tấm <span className="login-brown">ngon, </span>{" "}
            <span className="login-green">Tắc </span>
            <span className="login-brown">nhớ!</span>
          </h1>
          <p className="subtitle">
            Thương hiệu cơm tấm hàng đầu dành cho sinh viên.
          </p>
          <Form form={loginForm} name="login" onFinish={onFinish}>
            <Form.Item
              name="email"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Nhập email" }]}
            >
              <Input placeholder="Email" className="input-field" />
            </Form.Item>
            <Form.Item
              name="password"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Mật khẩu" className="input-field" />
            </Form.Item>
            <Link to="/forgot-password" className="link-forgot-password">
              Quên mật khẩu
            </Link>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button className="login-button" htmlType="submit">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          <Divider
            style={{ color: "#632713", fontFamily: "'Montserrat', sans-serif" }}
          >
            Hoặc
          </Divider>
          <Button
            className="google-login-button"
            onClick={handleGoogleLogin}
            icon={<GoogleIcon />}
          >
            Đăng nhập bằng Google
          </Button>
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
