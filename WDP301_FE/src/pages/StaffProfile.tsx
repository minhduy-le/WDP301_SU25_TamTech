import { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Modal,
} from "antd";
import { EditOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetProfileUser, useUpdateProfile } from "../hooks/profileApi";
import { useAuthStore } from "../hooks/usersApi";

const { Title, Text } = Typography;

const StaffProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: userProfile, refetch } = useGetProfileUser(userId || 0);
  const { mutate: updateProfile } = useUpdateProfile();

  const handleEdit = () => {
    setEditMode(true);
    form.setFieldsValue({
      fullName: userProfile?.user.fullName || "",
      date_of_birth: userProfile?.user.date_of_birth
        ? dayjs(userProfile.user.date_of_birth, "YYYY-MM-DD")
        : null,
      phone_number: userProfile?.user.phone_number || "",
      email: userProfile?.user.email || "",
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth
          ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
          : "",
      };
      updateProfile(
        {
          id: userId || 0,
          data: formattedValues,
        },
        {
          onSuccess: () => {
            refetch();
            message.success("Cập nhật thông tin thành công");
          },
          onError: (error) => {
            const errorMessage = error.message;
            if (errorMessage === "Phone number already exists") {
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
        }
      );
    });
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
      await passwordForm.validateFields();
      setIsPasswordModalOpen(false);
      message.success("Đổi mật khẩu thành công!");
    } catch {
      /* empty */
    }
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        background: "#fefce8",
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
          boxShadow: "0 4px 24px rgba(146,64,14,0.10)",
          width: 520,
          padding: "48px 32px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <UserOutlined
            style={{ fontSize: 96, color: "#d97706", marginBottom: 16 }}
          />
        </div>
        {!editMode ? (
          <>
            <Title level={2} style={{ marginBottom: 0, textAlign: "center" }}>
              {userProfile?.user.fullName}
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {userProfile?.user.email}
            </Text>
            <div
              style={{ fontSize: 18, marginBottom: 24, textAlign: "center" }}
            >
              <div>
                <b>Số điện thoại:</b>{" "}
                {userProfile?.user.phone_number || (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </div>
              <div>
                <b>Ngày sinh:</b>{" "}
                {userProfile?.user.date_of_birth ? (
                  dayjs(userProfile?.user.date_of_birth).format("DD/MM/YYYY")
                ) : (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <Button
                icon={<LockOutlined />}
                onClick={handleOpenPasswordModal}
                style={{
                  borderRadius: 8,
                  borderColor: "#d97706",
                  color: "#d97706",
                  fontWeight: 500,
                }}
              >
                Đổi mật khẩu
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{
                  background: "#92400e",
                  borderColor: "#92400e",
                  borderRadius: 8,
                  fontWeight: 500,
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
              fullName: userProfile?.user.fullName || "",
              date_of_birth: userProfile?.user.date_of_birth
                ? dayjs(userProfile.user.date_of_birth, "YYYY-MM-DD")
                : null,
              phone_number: userProfile?.user.phone_number || "",
              email: userProfile?.user.email || "",
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
              <Input value={userProfile?.user.email} disabled size="large" />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item name="date_of_birth" label="Ngày sinh">
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                size="large"
              />
            </Form.Item>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Button
                type="primary"
                onClick={handleSave}
                style={{
                  background: "#92400e",
                  borderColor: "#92400e",
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Lưu
              </Button>
              <Button
                onClick={handleCancel}
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
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
          okButtonProps={{
            style: {
              background: "#92400e",
              borderColor: "#92400e",
              borderRadius: 8,
            },
          }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
        >
          <Form form={passwordForm} layout="vertical">
            <Form.Item
              name="oldPassword"
              label="Mật khẩu hiện tại"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
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
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default StaffProfile;
