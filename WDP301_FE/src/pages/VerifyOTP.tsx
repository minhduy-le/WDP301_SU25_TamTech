import { Input, Button, Form, message } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import type { GetProps } from "antd";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyOTP } from "../hooks/usersApi";

type OTPProps = GetProps<typeof Input.OTP>;

const VerifyOTP = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: verifyOTP } = useVerifyOTP();
  const location = useLocation();
  // const storedEmail = localStorage.getItem("email");
  // const email = location.state?.email || storedEmail;
  const email = location.state?.email;

  const handleFinish = (values: { otp: string }) => {
    if (!email) {
      message.error("Không tìm thấy email. Vui lòng nhập lại!");
      return;
    }

    const payload = { email, otp: values.otp };

    // localStorage.setItem("otp", values.otp);

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
