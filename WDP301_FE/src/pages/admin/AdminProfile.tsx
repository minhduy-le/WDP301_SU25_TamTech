import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Form, Input, DatePicker, message, Modal } from "antd";
import { EditOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
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
  };  
};

const AdminProfile: React.FC = () => {
  const [admin, setAdmin] = useState(getAdminFromLocalStorage());
  const [editMode, setEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    setAdmin(getAdminFromLocalStorage());
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
        date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : "",
      };
      setAdmin(newAdmin);
      localStorage.setItem("adminInfo", JSON.stringify(newAdmin));
      setEditMode(false);
      message.success("Cập nhật thông tin thành công!");
    } catch {}
  };

  const handleCancel = () => {
    setEditMode(false);
    form.resetFields();
  };

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    passwordForm.resetFields();
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `https://wdp301-su25.space/api/auth/change-password`,
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
        setIsPasswordModalOpen(false);
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
      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          boxShadow: "0 4px 24px rgba(76,175,80,0.10)",
          width: 520,
          padding: "48px 32px",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <UserOutlined style={{ fontSize: 96, color: "#4CAF50", marginBottom: 16 }} />
        </div>
        {!editMode ? (
          <>
            <Title level={2} style={{ marginBottom: 0, textAlign: "center" }}>{admin.fullName || "Admin"}</Title>
            <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>{admin.email}</Text>
            <div style={{ fontSize: 18, marginBottom: 24, textAlign: "center" }}>
              <div><b>Số điện thoại:</b> {admin.phone_number || <Text type="secondary">Chưa cập nhật</Text>}</div>
              {/* <div><b>Ngày sinh:</b> {admin.date_of_birth ? dayjs(admin.date_of_birth).format("DD/MM/YYYY") : <Text type="secondary">Chưa cập nhật</Text>}</div>
              <div><b>Ghi chú:</b> {admin.note || <Text type="secondary">-</Text>}</div> */}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <Button
                icon={<LockOutlined />}
                onClick={handleOpenPasswordModal}
                style={{ borderRadius: 8, borderColor: "#4CAF50", color: "#4CAF50", fontWeight: 500,outline: "none" }}
              >
                Đổi mật khẩu
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ background: "#2E7D32", borderColor: "#2E7D32", borderRadius: 8, fontWeight: 500 }}
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
              date_of_birth: admin.date_of_birth ? dayjs(admin.date_of_birth) : null,
            }}
          >
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={admin.email} disabled size="large" />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="Số điện thoại"
              rules={[
                { pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item name="date_of_birth" label="Ngày sinh">
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" size="large" />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={2} size="large" />
            </Form.Item>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Button type="primary" onClick={handleSave} style={{ background: "#2E7D32", borderColor: "#2E7D32", borderRadius: 8, fontWeight: 500 }}>
                Lưu
              </Button>
              <Button onClick={handleCancel} style={{ borderRadius: 8, fontWeight: 500 }}>
                Hủy
              </Button>
            </div>
          </Form>
        )}

        <Modal
          title="Đổi mật khẩu"
          open={isPasswordModalOpen}
          onCancel={() => setIsPasswordModalOpen(false)}
          onOk={handleChangePassword}
          okText="Đổi mật khẩu"
          cancelText="Hủy"
          okButtonProps={{ style: { background: "#2E7D32", borderColor: "#2E7D32", borderRadius: 8, outline: "none" } }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
        >
          <Form form={passwordForm} layout="vertical">
            <Form.Item
              name="oldPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
              style={{ marginBottom: 0 }}
            >
              <Input.Password size="large" style={{ marginBottom: 16 }} />
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
              <Input.Password size="large" style={{ marginBottom: 16 }} />
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
                    return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminProfile;