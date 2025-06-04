/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Button, message, Form, Divider } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, type LoginDto } from "../hooks/usersApi";
import { useMutation } from "@tanstack/react-query";
import Role from "../enums/role.enum";
import { GoogleLogin } from "@react-oauth/google";

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
          navigate("/dashboard");
          // } else if (
          //   response.role === RoleCode.STAFF ||
          //   response.role === RoleCode.THERAPIST
          // ) {
          //   navigate(PagePath.BOOKING);
        } else {
          navigate("/");
        }
        message.success("Đăng nhập thành công");
      } else {
        message.error(response.message);
      }
    },
    onError: (error) => {
      message.error("Login failed: " + (error as Error).message);
    },
  });

  const googleLoginMutation = useMutation<
    { success: boolean; message: string; role: string },
    unknown,
    { idToken: string }
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
      message.error("Google login failed: " + (error as Error).message);
    },
  });

  const handleGoogleSuccess = (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (idToken) {
      googleLoginMutation.mutate({ idToken });
    } else {
      message.error("No ID token received from Google");
    }
  };

  const handleGoogleError = () => {
    message.error("Google login failed");
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
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="circle"
          />
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
