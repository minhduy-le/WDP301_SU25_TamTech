import { Input, Button, Form, message, DatePicker } from "antd";
import "../style/Login.css";
import APP_LOGIN from "../assets/login.png";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/usersApi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const Register = () => {
  const [registerForm] = Form.useForm();
  const { mutate: createAccount } = useRegister();
  const navigate = useNavigate();

  const currentDate = dayjs().endOf("day");

  const handleCreateAccount = () => {
    registerForm
      .validateFields()
      .then((values) => {
        const formattedValues = {
          ...values,
          date_of_birth: values.date_of_birth.format("YYYY-MM-DD"),
        };
        createAccount(formattedValues, {
          onSuccess: () => {
            message.success("Tạo tài khoản thành công! Hãy xác thực OTP.");
            const email = values.email;
            setTimeout(() => {
              // navigate("/login");
              navigate("/verify-otp", { state: { email } });
              registerForm.resetFields();
            }, 100);
          },
          onError: (error) => {
            // message.error(`Lỗi tạo tài khoản: ${err.message}`);
            const errorMessage = (error as unknown as { responseValue: string })
              .responseValue;
            if (
              errorMessage === "Full name must be between 2 and 20 characters"
            ) {
              message.error("Họ tên phải từ 2 đến 20 ký tự");
            } else if (
              errorMessage ===
              "Email must be valid and not exceed 100 characters"
            ) {
              message.error("Email phải hợp lệ và không quá 100 ký tự");
            } else if (
              errorMessage === "Phone number must be 10 or 11 digits"
            ) {
              message.error("Số điện thoại phải có 10 hoặc 11 chữ số");
            } else if (
              errorMessage === "Password must be between 6 and 250 characters"
            ) {
              message.error("Mật khẩu phải từ 6 đến 250 ký tự");
            } else if (
              errorMessage ===
              "Date of birth must be valid and not in the future"
            ) {
              message.error(
                "Ngày sinh phải hợp lệ và không được trong tương lai"
              );
            } else if (errorMessage === "Phone number already exists") {
              message.error(
                "Số điện thoại đã được sử dụng. Vui lòng sử dụng số khác."
              );
            } else if (errorMessage === "Email already exists") {
              message.error(
                "Email đã được sử dụng. Vui lòng sử dụng email khác."
              );
            } else {
              message.error(errorMessage);
            }
          },
        });
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
  };

  const handlePhoneNumberKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault(); // Block non-numeric characters
    }
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
              <Input
                placeholder="Số điện thoại"
                className="input-field"
                onKeyPress={handlePhoneNumberKeyPress}
              />
            </Form.Item>
            <Form.Item
              name="date_of_birth"
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Nhập ngày sinh" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{
                  width: "100%",
                  height: "40px",
                }}
                placeholder="Chọn ngày sinh"
                className="input-field"
                disabledDate={(d) => !d || d.isAfter(currentDate)}
              />
            </Form.Item>
            <Form.Item
              name="password"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Nhập mật khẩu" },
                {
                  min: 8,
                  message: "Mật khẩu phải dài ít nhất 8 ký tự",
                },
                {
                  pattern: /[A-Z]/,
                  message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa",
                },
                {
                  pattern: /[!@#$%^&*(),.?":{}|<>]/,
                  message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
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
