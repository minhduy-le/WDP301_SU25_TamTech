/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Button, Form, message } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/usersApi";

const Register = () => {
  const [registerForm] = Form.useForm();
  const { mutate: createAccount } = useRegister();
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    registerForm
      .validateFields()
      .then((values) => {
        createAccount(values, {
          onSuccess: () => {
            message.success("Tạo tài khoản thành công! Hãy xác thực OTP.");
            const email = values.email;
            setTimeout(() => {
              // navigate("/login");
              navigate("/verify-otp", { state: { email } });
              registerForm.resetFields();
            }, 100);
          },
          onError: (err: { message: any }) => {
            message.error(`Lỗi tạo tài khoản: ${err.message}`);
          },
        });
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
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
            Tấm <span className="login-brown">ngon,</span>{" "}
            <span className="login-green">Tắc </span>{" "}
            <span className="login-brown">nhớ!</span>
          </h1>
          <p className="subtitle">
            Thương hiệu cơm tấm hàng đầu dành cho sinh viên.
          </p>
          <Form
            form={registerForm}
            name="register"
            onFinish={handleCreateAccount}
          >
            <Form.Item
              name="fullName"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Nhập tên đầy đủ" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const wordCount = value.trim().split(/\s+/).length;
                    if (wordCount > 20) {
                      return Promise.reject("Tên không được vượt quá 20 từ");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Họ tên" className="input-field" />
            </Form.Item>
            <Form.Item
              name="email"
              style={{ marginBottom: 0 }}
              rules={[
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
                {
                  required: true,
                  message: "Nhập email",
                },
                { max: 100, message: "Email không được vượt quá 100 ký tự" },
              ]}
            >
              <Input placeholder="Email" className="input-field" />
            </Form.Item>
            <Form.Item
              name="phone_number"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Nhập số điện thoại" },
                {
                  pattern: /^\d+$/,
                  message: "Số điện thoại chỉ được chứa chữ số",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (value.length > 12) {
                      return Promise.reject(
                        "Số điện thoại không được vượt quá 12 chữ số"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Số điện thoại" className="input-field" />
            </Form.Item>
            <Form.Item
              name="password"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Nhập mật khẩu" },
                {
                  min: 6,
                  message: "Mật khẩu phải dài hơn 6 ký tự",
                },
              ]}
            >
              <Input.Password placeholder="Mật khẩu" className="input-field" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button className="login-button" htmlType="submit">
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
          <div className="divider">
            <span className="divider-text">
              <Link to="/login">Bạn là người nhà của Tấm Tắc?</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
