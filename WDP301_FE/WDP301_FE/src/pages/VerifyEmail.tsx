import { Input, Button, message, Form } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/usersApi";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { mutate: forgotPassword } = useForgotPassword();

  const handleVerifyAccount = () => {
    form
      .validateFields()
      .then((values) => {
        localStorage.setItem("email", values.email);
        forgotPassword(values, {
          onSuccess: () => {
            message.success("OTP đã được gửi đến email của bạn!");
            navigate("/verify-otp", { state: { email: values.email } });
          },
          onError: (error: Error) => {
            message.error("Gửi OTP thất bại: " + (error as Error).message);
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
        <div className="form-content">
          <h1 className="title">
            Tấm <span className="login-brown">ngon</span>,{" "}
            <span className="login-green">Tắc </span>
            <span className="login-brown">nhớ!</span>
          </h1>
          <p className="subtitle">
            Thưởng thức cơm tấm hàng đầu dành cho sinh viên.
          </p>
          <Form form={form} name="control-hooks" onFinish={handleVerifyAccount}>
            <Form.Item
              name="email"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Nhập email" }]}
            >
              <Input placeholder="Email" className="input-field" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button className="login-button" htmlType="submit">
                Gửi
              </Button>
            </Form.Item>
          </Form>
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

export default VerifyEmail;
