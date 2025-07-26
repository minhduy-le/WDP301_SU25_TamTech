import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  UserOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;

const getAdminFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("user");
    if (data) return JSON.parse(data);
  } catch {}
  return {
    fullName: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    note: "",
    role: "",
  };
};

const AdminProfile: React.FC = () => {
  const [admin, setAdmin] = useState(getAdminFromLocalStorage());
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const id = user.id;
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}profiles/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.data && res.data.user) {
          setAdmin(res.data.user);
        }
      } catch (error) {
        setAdmin(getAdminFromLocalStorage());
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    form.setFieldsValue({
      ...admin,
      date_of_birth: admin.date_of_birth ? dayjs(admin.date_of_birth) : null,
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newAdmin = {
        ...admin,
        ...values,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : "",
      };
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const id = user.id;
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}profiles/${id}`,
        newAdmin,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAdmin(newAdmin);
      localStorage.setItem("adminInfo", JSON.stringify(newAdmin));
      setEditMode(false);
      message.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    form.resetFields();
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}auth/change-password`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        message.success("Đổi mật khẩu thành công!");
        passwordForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        background: "#e8f5e9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <style>
        {`
         /* Đổi màu border khi focus và hover cho Input thường */
.ant-input:focus, .ant-input-focused,
.ant-input:hover {
  border-color: #4CAF50 !important;
  box-shadow: none !important;
}

/* Đổi màu border khi focus và hover cho Input.Password */
.ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused,
.ant-input-affix-wrapper:hover {
  border-color: #4CAF50 !important;
  box-shadow: none !important;
}

/* Đổi màu border khi focus và hover cho DatePicker */
.ant-picker:focus, .ant-picker-focused,
.ant-picker:hover {
  border-color: #4CAF50 !important;
  box-shadow: none !important;
}
}`}
      </style>
      <Row
        gutter={[32, 32]}
        style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}
      >
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow: "0 4px 24px rgba(76,175,80,0.10)",
              width: "100%",
              padding: "32px 24px",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              minHeight: 480,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <UserOutlined
                style={{ fontSize: 72, color: "#4CAF50", marginBottom: 8 }}
              />
            </div>
            {!editMode ? (
              <>
                <Title
                  level={3}
                  style={{ marginBottom: 0, textAlign: "center" }}
                >
                  {admin.fullName || "Admin"}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  {admin.email}
                </Text>
                <div
                  style={{
                    fontSize: 16,
                    marginBottom: 24,
                    textAlign: "center",
                  }}
                >
                  <div>
                    <b>Vai trò: </b>{" "}
                    {admin.role || <Text type="secondary">Chưa cập nhật</Text>}
                  </div>
                  <div>
                    <b>Số điện thoại:</b>{" "}
                    {admin.phone_number || (
                      <Text type="secondary">Chưa cập nhật</Text>
                    )}
                  </div>
                  <div>
                    <b>Ngày sinh:</b>{" "}
                    {admin.date_of_birth ? (
                      dayjs(admin.date_of_birth).format("DD/MM/YYYY")
                    ) : (
                      <Text type="secondary">Chưa cập nhật</Text>
                    )}
                  </div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center", gap: 16 }}
                >
                  <Button
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={handleEdit}
                    style={{
                      background: "#2E7D32",
                      borderColor: "#2E7D32",
                      borderRadius: 8,
                      fontWeight: 500,
                      outline: "none",
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              </>
            ) : (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  ...admin,
                  date_of_birth: admin.date_of_birth
                    ? dayjs(admin.date_of_birth)
                    : null,
                }}
                style={{ marginTop: 8 }}
              >
                <Form.Item
                  name="fullName"
                  label={<b>Họ và tên</b>}
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item label={<b>Email</b>}>
                  <Input value={admin.email} disabled size="large" />
                </Form.Item>
                <Form.Item
                  name="phone_number"
                  label={<b>Số điện thoại</b>}
                  rules={[
                    {
                      pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="date_of_birth" label={<b>Ngày sinh</b>}>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    size="large"
                  />
                </Form.Item>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    marginTop: 8,
                  }}
                >
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    style={{
                      background: "#2E7D32",
                      borderRadius: 8,
                      fontWeight: 500,
                      outline: "none",
                      borderColor: "#2E7D32",
                    }}
                  >
                    Lưu
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    style={{
                      borderRadius: 8,
                      fontWeight: 500,
                      outline: "none",
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow: "0 4px 24px rgba(76,175,80,0.10)",
              width: "100%",
              padding: "32px 24px",
              background: "#fff",
              minHeight: 480,
            }}
          >
            <Title
              level={4}
              style={{
                textAlign: "center",
                marginBottom: 24,
                outline: "none",
                marginTop: 0,
              }}
            >
              Đổi mật khẩu
            </Title>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              style={{ maxWidth: 400, margin: "0 auto" }}
            >
              <Form.Item
                name="oldPassword"
                label="Mật khẩu hiện tại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
                hasFeedback
                style={{ marginBottom: 0 }}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Hai mật khẩu không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockOutlined />}
                  style={{
                    background: "#2E7D32",
                    borderColor: "#2E7D32",
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminProfile;
