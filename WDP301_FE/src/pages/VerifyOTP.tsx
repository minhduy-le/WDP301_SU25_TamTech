import { Input, Button, Form, message } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import type { GetProps } from "antd";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useResendOTP, useVerifyOTP } from "../hooks/usersApi";
import { useEffect, useState } from "react";

type OTPProps = GetProps<typeof Input.OTP>;

const VerifyOTP = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: verifyOTP } = useVerifyOTP();
  const { mutate: resendOTP } = useResendOTP();
  const location = useLocation();
  const email = location.state?.email;

  const [countdown, setCountdown] = useState<number>(60); // 01:00 = 60 giây
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    // Bắt đầu đếm ngược khi component mount
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer); // Cleanup timer khi unmount
    }
  }, [countdown]);

  const handleFinish = (values: { otp: string }) => {
    if (!email) {
      message.error("Không tìm thấy email. Vui lòng nhập lại!");
      return;
    }

    const payload = { email, otp: values.otp };

    verifyOTP(payload, {
      onSuccess: () => {
        message.success("Tài khoản của bạn đã được kích hoạt");
        navigate("/login");
      },
      onError: (error: Error) => {
        message.error("Xác thực OTP thất bại: " + error.message);
      },
    });
  };

  const onChange: OTPProps["onChange"] = (text) => {
    console.log("onChange:", text);
  };

  const onInput: OTPProps["onInput"] = (value) => {
    console.log("onInput:", value);
  };

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };

  const handleResendOTP = () => {
    if (!email) {
      message.error("Không tìm thấy email. Vui lòng nhập lại!");
      return;
    }

    resendOTP(
      { email },
      {
        onSuccess: () => {
          message.success("OTP đã được gửi lại thành công!");
          setCountdown(60); // Reset đếm ngược sau khi gửi lại
          setIsResendDisabled(true);
        },
        onError: (error: Error) => {
          message.error("Gửi lại OTP thất bại: " + error.message);
        },
      }
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
  };

  return (
    <div className="login-container">
      <div className="image-section">
        <img src={APP_LOGIN} alt="Food" className="food-image" />
      </div>
      <div className="form-section">
        <div className="form-content">
          <h1 className="title">
            Tấm <span className="login-brown">ngon,</span>{" "}
            <span className="login-green">Tắc </span>
            <span className="login-brown">nhớ!</span>
          </h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Mã OTP vừa được gửi vào {email}.
          </p>
          <p className="subtitle">Nhập OTP để kích hoạt tài khoản.</p>
          <Form
            form={form}
            name="control-hooks"
            onFinish={handleFinish}
            className="otp"
          >
            <Form.Item
              name="otp"
              rules={[{ required: true, message: "Nhập OTP" }]}
            >
              <Input.OTP
                className="input-field"
                style={{
                  width: "-webkit-fill-available",
                  color: "#632713",
                }}
                formatter={(str) => str.replace(/\D/g, "")}
                {...sharedProps}
              />
            </Form.Item>
            <Form.Item>
              <Button className="login-button" htmlType="submit">
                Xác thực
              </Button>
            </Form.Item>
          </Form>
          {countdown > 0 && (
            <p
              className="subtitle"
              style={{ marginTop: 10, textAlign: "center" }}
            >
              Gửi lại OTP sau{" "}
              <span style={{ fontWeight: "bold" }}>
                {formatTime(countdown)}
              </span>
            </p>
          )}
          <Button
            className="login-button"
            onClick={handleResendOTP}
            disabled={isResendDisabled}
            style={{ width: "100%" }}
          >
            Gửi lại OTP
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

export default VerifyOTP;
