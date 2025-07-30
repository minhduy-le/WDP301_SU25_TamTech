/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Layout,
  Menu,
  Divider,
  Modal,
  Form,
  Input,
  Button,
  message,
  DatePicker,
} from "antd";
import "../style/UserInformation.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import UserBoldIcon from "../components/icon/UserBoldIcon";
import { ContainerOutlined, EditOutlined } from "@ant-design/icons";
import PromotionIcon from "../components/icon/PromotionIcon";
import { useAuthStore, useChangePassword } from "../hooks/usersApi";
import { useGetProfileUser, useUpdateProfile } from "../hooks/profileApi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

const { Sider, Content } = Layout;

dayjs.extend(customParseFormat);

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: userProfile, refetch } = useGetProfileUser(userId || 0);
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: changePassword } = useChangePassword();

  const [activePage, setActivePage] = useState(() => {
    if (location.pathname === "/user/information") return "1";
    if (location.pathname === "/user/order-history") return "3";
    if (location.pathname === "/user/promotion") return "4";
    return "1";
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [updateForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();

  useEffect(() => {
    if (userProfile) {
      updateForm.setFieldsValue({
        fullName: userProfile.user.fullName || "",
        date_of_birth: userProfile.user.date_of_birth
          ? dayjs(userProfile.user.date_of_birth, "YYYY-MM-DD")
          : null,
        phone_number: userProfile.user.phone_number || "",
        email: userProfile.user.email || "",
      });
    }
  }, [userProfile, updateForm]);

  const handleMenuClick = (key: string) => {
    setActivePage(key);
    switch (key) {
      case "1":
        navigate("/user/information");
        break;
      case "3":
        navigate("/user/order-history");
        break;
      case "4":
        navigate("/user/promotion");
        break;
      default:
        navigate("/user/information");
    }
  };

  const showModal = () => setIsModalVisible(true);
  const handleOk = () => {
    updateForm
      .validateFields()
      .then((values) => {
        const currentDate = dayjs();
        const formattedValues = {
          ...values,
          date_of_birth: values.date_of_birth
            ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
            : "",
        };

        if (!values.email.includes("@")) {
          message.error("Email phải chứa ký tự '@'!");
          return;
        }

        const dob = dayjs(values.date_of_birth);
        if (dob.isSame(currentDate, "day") || dob.isAfter(currentDate)) {
          message.error("Ngày sinh phải là ngày trong quá khứ!");
          return;
        }

        const phone = values.phone_number.replace(/\D/g, "");
        if (!/^\d{10}$|^\d{11}$/.test(phone)) {
          message.error("Số điện thoại phải có 10 hoặc 11 số!");
          return;
        }

        updateProfile(
          { id: userId || 0, data: formattedValues },
          {
            onSuccess: () => {
              refetch();
              message.success("Cập nhật thông tin thành công");
              setIsModalVisible(false);
            },
            onError: (error: any) => {
              const errorMessage = error.message;
              if (errorMessage === "Email already exists") {
                message.error("Email đã tồn tại");
              } else if (errorMessage === "Phone number already exists") {
                message.error("Số điện thoại đã tồn tại");
              } else {
                message.error(errorMessage || "Cập nhật thất bại");
              }
            },
          }
        );
      })
      .catch((error) => console.error("Validation failed:", error));
  };
  const handleCancel = () => setIsModalVisible(false);

  const showModalChangePassword = () => setIsChangePasswordModalVisible(true);
  const handleChangePassword = () => {
    changePasswordForm
      .validateFields()
      .then((values) => {
        const changePasswordData = {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        };
        changePassword(changePasswordData, {
          onSuccess: () => {
            message.success("Thay đổi mật khẩu thành công");
            setIsChangePasswordModalVisible(false);
            changePasswordForm.resetFields();
          },
          onError: (error: any) => {
            const errorMessage =
              error.responseValue || "Thay đổi mật khẩu thất bại";
            if (errorMessage === "Incorrect old password") {
              message.error("Mật khẩu cũ không đúng");
            } else if (
              errorMessage === "Old password must be at least 6 characters"
            ) {
              message.error("Mật khẩu cũ phải có ít nhất 6 ký tự");
            } else if (
              errorMessage === "New password must be at least 6 characters"
            ) {
              message.error("Mật khẩu mới phải có ít nhất 6 ký tự");
            } else {
              message.error(errorMessage);
            }
            console.error("Change password failed:", error);
          },
        });
      })
      .catch((error) => console.error("Validation failed:", error));
  };
  const handleChangePasswordCancel = () => {
    setIsChangePasswordModalVisible(false);
    changePasswordForm.resetFields();
  };

  return (
    <div className="user-info-container">
      <Layout style={{ minHeight: "510px", background: "#fff7e6" }}>
        <Sider className="user-sider">
          <div className="user-details">
            <p className="user-name">
              {userProfile?.user.fullName || "Dummy Tester VietNamese"}
            </p>
            <p className="user-email">
              {userProfile?.user.phone_number || "0902346789"}
            </p>
            <p className="user-email">
              {userProfile?.user.email || "dummytestervietnamese@gmail.com"}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="edit" onClick={showModal}>
                <EditOutlined style={{ color: "#da7339" }} />
                <div className="edit-profile">Chỉnh sửa</div>
              </div>
              <div className="edit" onClick={showModalChangePassword}>
                <EditOutlined style={{ color: "#da7339" }} />
                <div className="edit-profile">Đổi mật khẩu</div>
              </div>
            </div>
            <Divider style={{ borderTop: "1px solid #da7339" }} />
            <Menu
              mode="vertical"
              className="sidebar-menu"
              selectedKeys={[activePage]}
              style={{ borderInlineEnd: "none" }}
              onClick={({ key }) => handleMenuClick(key)}
            >
              <Menu.Item key="1" className="menu-item">
                <UserBoldIcon /> Thông tin thành viên
              </Menu.Item>
              <Menu.Item key="3" className="menu-item">
                <ContainerOutlined
                  style={{ fontSize: 20, color: "#2D1E1A", marginRight: 10 }}
                />{" "}
                Lịch sử mua hàng
              </Menu.Item>
              <Menu.Item key="4" className="menu-item">
                <PromotionIcon /> Ưu đãi
              </Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout
          style={{ padding: "0 20px", background: "#fff7e6", borderRadius: 10 }}
        >
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Cập nhật"
        cancelText="Hủy"
        footer={null}
        className="modal-edit-profile"
      >
        <Form
          form={updateForm}
          layout="vertical"
          name="updateProfile"
          initialValues={{
            fullName: userProfile?.user.fullName || "",
            date_of_birth: userProfile?.user.date_of_birth
              ? dayjs(userProfile.user.date_of_birth, "YYYY-MM-DD")
              : null,
            phone_number: userProfile?.user.phone_number || "",
            email: userProfile?.user.email || "",
          }}
        >
          <div className="edit-title">Thông tin thành viên</div>
          <Divider
            style={{ borderTop: "1px solid #2D1E1A", margin: "12px 0" }}
          />
          <Form.Item
            name="fullName"
            label="Họ và tên*"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date_of_birth"
            label="Ngày sinh*"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker format="DD/MM/YYYY" className="select-date-of-birth" />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Số điện thoại*"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email*"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleOk}
              className="update-profile-btn"
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        visible={isChangePasswordModalVisible}
        onOk={handleChangePassword}
        onCancel={handleChangePasswordCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        footer={null}
        className="modal-edit-profile"
      >
        <Form
          form={changePasswordForm}
          layout="vertical"
          name="changePassword"
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
        >
          <div className="edit-title">Thay đổi mật khẩu</div>
          <Divider
            style={{ borderTop: "1px solid #2D1E1A", margin: "12px 0" }}
          />
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ*"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới*"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới*"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Mật khẩu không khớp với mật khẩu mới!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleChangePassword}
              className="update-profile-btn"
            >
              Xác nhận
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserLayout;
