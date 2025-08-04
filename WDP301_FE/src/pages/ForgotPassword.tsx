import { Input, Button, message, Form } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link } from "react-router-dom";
import { type ForgorPasswordDto, useForgotPassword } from "../hooks/usersApi";
import { useState, useEffect } from "react";

const ForgotPassword = () => {
  const [forgotPasswordForm] = Form.useForm();
  const forgotPasswordMutation = useForgotPassword();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isButtonDisabled]);

  const onFinish = (values: ForgorPasswordDto) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        message.success(
          "Mã OTP đã được gửi. Mã OTP chỉ tồn tại trong 60 giây thôi!"
        );
        setIsButtonDisabled(true);
        setTimeLeft(60);
      },
      onError: (error) => {
        const errorMessage =
          (error as unknown as { responseValue: string }).responseValue ||
          "Gửi mã OTP thất bại";
        message.error(errorMessage);
      },
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
            Tấm <span className="login-brown">ngon, </span>{" "}
            <span className="login-green">Tắc </span>
            <span className="login-brown">nhớ!</span>
          </h1>
          <p className="subtitle">Vui lòng nhập email để nhận OTP xác thực!</p>
          <Form
            form={forgotPasswordForm}
            name="forgotPassword"
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input placeholder="Email" className="input-field" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className="login-button"
                htmlType="submit"
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? `Gửi lại sau ${timeLeft}s` : "Gửi mã OTP"}
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

export default ForgotPassword;
