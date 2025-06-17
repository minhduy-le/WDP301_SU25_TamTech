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
import { useGetProfileUser, useUpdateProfile } from "../../hooks/profileApi";
import { useAuthStore } from "../../hooks/usersApi";
import axios from "axios";

const { Title, Text } = Typography;

const ManagerProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: userProfile, refetch } = useGetProfileUser(userId || 0);
  const { mutate: updateProfile } = useUpdateProfile();

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

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
            setEditMode(false);
          },
          onError: (error) => {
            message.error("Cập nhật thông tin thất bại");
            console.error("Update failed:", error);
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
      const values = await passwordForm.validateFields();
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `https://wdp301-su25.space/api/auth/change-password`,
        {
          oldPassword: values.currentPassword,
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
        background: "#fff9f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <style>{`
        /* Your CSS styles remain the same */
        .ant-table-thead > tr > th { background-color: ${headerBgColor} !important; color: ${headerColor} !important; font-weight: bold !important; border-right: 1px solid ${borderColor} !important; border-bottom: 2px solid ${tableBorderColor} !important; }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { border-right: none !important; }
        .promo-table .ant-table-tbody > tr.even-row-promo > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr.odd-row-promo > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .promo-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .promo-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .promo-table .ant-table-cell-fix-right { background: inherit !important; }
        .promo-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background-color: ${headerBgColor} !important; }
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { border-color: #D97B41 !important; color: #D97B41 !important; }
        .ant-select-selector { border-color: #E9C97B !important; }
        .ant-select-selector:hover { border-color: #D97B41 !important; }
        .ant-table-column-sorter-up.active svg,
        .ant-table-column-sorter-down.active svg {
          color: #D97B41 !important;
          fill: #D97B41 !important;
        }
      `}</style>
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <UserOutlined
            style={{
              fontSize: "48px",
              color: "#da7339",
              background: "#fff7e6",
              padding: "12px",
              borderRadius: "50%",
            }}
          />
        </div>

        {!editMode ? (
          <>
            <Title level={3} style={{ textAlign: "center", marginBottom: "8px" }}>
              {userProfile?.user.fullName}
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              {userProfile?.user.email}
            </Text>

            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <div style={{ marginBottom: "12px" }}>
                <Text strong>Số điện thoại:</Text>{" "}
                {userProfile?.user.phone_number || (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </div>
              <div>
                <Text strong>Ngày sinh:</Text>{" "}
                {userProfile?.user.date_of_birth ? (
                  dayjs(userProfile?.user.date_of_birth).format("DD/MM/YYYY")
                ) : (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <Button
                icon={<LockOutlined />}
                onClick={handleOpenPasswordModal}
                style={{
                  borderRadius: "6px",
                  borderColor: "#da7339",
                  color: "#da7339",
                  outline: "none"
                }}
              >
                Đổi mật khẩu
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{
                  borderRadius: "6px",
                  background: "#da7339",
                  borderColor: "#da7339",
                  outline: "none"
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
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <Button
                type="primary"
                onClick={handleSave}
                style={{
                  borderRadius: "6px",
                  background: "#da7339",
                  borderColor: "#da7339",
                }}
              >
                Lưu
              </Button>
              <Button
                onClick={handleCancel}
                style={{ borderRadius: "6px" }}
              >
                Hủy
              </Button>
            </div>
          </Form>
        )}
      </Card>

      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        onOk={handleChangePassword}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: "#da7339",
            borderColor: "#da7339",
            borderRadius: "6px",
            outline: "none"
          },
        }}
        cancelButtonProps={{ style: { borderRadius: "6px" } }}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            style={{ marginBottom: 0 }}
          >
            <Input.Password size="large" style={{ marginBottom: 16 }}/>
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            style={{ marginBottom: 0 }}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password size="large" style={{ marginBottom: 16 }}/>
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            style={{ marginBottom: 0 }}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp"));
                },
              }),
            ]}
          >
            <Input.Password size="large" style={{ marginBottom: 16 }}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerProfile;
