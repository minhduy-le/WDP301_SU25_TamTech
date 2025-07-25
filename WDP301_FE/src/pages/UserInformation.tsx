/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Divider,
  Layout,
  Menu,
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Card,
  DatePicker,
  message,
} from "antd";
import "../style/UserInformation.css";
import { useEffect, useState } from "react";
import OrderTracking from "./OrderTracking";
import OrderHistorys from "./OrderHistory";
import UserBoldIcon from "../components/icon/UserBoldIcon";
import {
  ContainerOutlined,
  EditOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import PromotionIcon from "../components/icon/PromotionIcon";
import Promotion from "./Promotion";
import { useLocation, useNavigationType } from "react-router-dom";
import { useAuthStore, useChangePassword } from "../hooks/usersApi";
import LocationBoldIcon from "../components/icon/LocationBoldIcon";
import { useGetProfileUser, useUpdateProfile } from "../hooks/profileApi";
import "../style/AddressOrder.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetAddressUser } from "../hooks/locationsApi";

const { Sider, Content } = Layout;
const { Text } = Typography;

dayjs.extend(customParseFormat);

interface Contact {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const UserInfomation = () => {
  const [activePage, setActivePage] = useState("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditContactModalVisible, setIsEditContactModalVisible] =
    useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    // {
    //   id: 1,
    //   name: "Truong Quang Hieu Trung",
    //   phone: "0888777888",
    //   address:
    //     "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
    //   isDefault: false,
    // },
    // {
    //   id: 2,
    //   name: "Truong Quang Hieu Trung",
    //   phone: "0888777888",
    //   address:
    //     "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
    //   isDefault: false,
    // },
    // {
    //   id: 3,
    //   name: "Truong Quang Hieu Trung",
    //   phone: "0888777888",
    //   address:
    //     "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
    //   isDefault: true,
    // },
    // {
    //   id: 4,
    //   name: "Truong Quang Hieu Trung",
    //   phone: "0888777888",
    //   address:
    //     "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
    //   isDefault: false,
    // },
  ]);
  const [updateForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();
  const [editContactForm] = Form.useForm();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data: userProfile, refetch } = useGetProfileUser(userId || 0);
  const { data: addressUser } = useGetAddressUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: changePassword } = useChangePassword();

  const [showOrderTracking, setShowOrderTracking] = useState<boolean>(() => {
    const savedState = localStorage.getItem("showOrderTracking");
    return savedState ? JSON.parse(savedState) : false;
  });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(() => {
    const savedOrder = localStorage.getItem("selectedOrder");
    return savedOrder ? JSON.parse(savedOrder) : null;
  });

  useEffect(() => {
    if (addressUser && addressUser.length > 0) {
      const updatedContacts = addressUser.map((address, index) => ({
        id: index + 1,
        name: userProfile?.user.fullName || "Truong Quang Hieu Trung",
        phone: userProfile?.user.phone_number || "0888777888",
        address,
        isDefault: index === 0, // Đặt địa chỉ đầu tiên là mặc định
      }));
      setContacts(updatedContacts);
    }
  }, [addressUser, userProfile]);

  const handleMenuClick = (e: { key: string }) => {
    setActivePage(e.key);
    localStorage.setItem("userInfoActiveTab", e.key);
    if (e.key === "3") {
      const savedState = localStorage.getItem("showOrderTracking");
      const savedOrder = localStorage.getItem("selectedOrder");
      setShowOrderTracking(savedState ? JSON.parse(savedState) : false);
      setSelectedOrderId(savedOrder ? JSON.parse(savedOrder) : null);
    } else {
      setShowOrderTracking(false);
      setSelectedOrderId(null);
      localStorage.setItem("showOrderTracking", JSON.stringify(false));
      localStorage.setItem("selectedOrder", JSON.stringify(null));
    }
  };

  useEffect(() => {
    const savedTab = localStorage.getItem("userInfoActiveTab");

    if (location.pathname === "/user-information") {
      if (navigationType === "PUSH") {
        setActivePage("1");
        localStorage.setItem("userInfoActiveTab", "1");
        setShowOrderTracking(false);
        setSelectedOrderId(null);
        localStorage.setItem("showOrderTracking", JSON.stringify(false));
        localStorage.setItem("selectedOrder", JSON.stringify(null));
      } else if (savedTab) {
        setActivePage(savedTab);
        if (savedTab === "3") {
          const savedState = localStorage.getItem("showOrderTracking");
          const savedOrder = localStorage.getItem("selectedOrder");
          setShowOrderTracking(savedState ? JSON.parse(savedState) : false);
          setSelectedOrderId(savedOrder ? JSON.parse(savedOrder) : null);
        } else {
          setShowOrderTracking(false);
          setSelectedOrderId(null);
          localStorage.setItem("showOrderTracking", JSON.stringify(false));
          localStorage.setItem("selectedOrder", JSON.stringify(null));
        }
      } else {
        setActivePage("1");
        localStorage.setItem("userInfoActiveTab", "1");
        setShowOrderTracking(false);
        setSelectedOrderId(null);
        localStorage.setItem("showOrderTracking", JSON.stringify(false));
        localStorage.setItem("selectedOrder", JSON.stringify(null));
      }
    }
  }, [location.pathname, navigationType]);

  const showModal = () => {
    updateForm.setFieldsValue({
      fullName: userProfile?.user.fullName || "",
      date_of_birth: userProfile?.user.date_of_birth
        ? dayjs(userProfile.user.date_of_birth, "YYYY-MM-DD")
        : null,
      phone_number: userProfile?.user.phone_number || "",
      email: userProfile?.user.email || "",
    });
    setIsModalVisible(true);
  };

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

        // Validate email must contain @
        if (!values.email.includes("@")) {
          message.error("Email phải chứa ký tự '@'!");
          return;
        }

        // Validate date of birth must be in the past
        const dob = dayjs(values.date_of_birth);
        if (dob.isSame(currentDate, "day") || dob.isAfter(currentDate)) {
          message.error("Ngày sinh phải là ngày trong quá khứ!");
          return;
        }

        // Validate phone number must be 10 or 11 digits
        const phone = values.phone_number.replace(/\D/g, ""); // Remove non-digit characters
        if (!/^\d{10}$|^\d{11}$/.test(phone)) {
          message.error("Số điện thoại phải có 10 hoặc 11 số!");
          return;
        }

        updateProfile(
          {
            id: userId || 0,
            data: formattedValues,
          },
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
      .catch((error) => {
        // Handle validation errors if any (though we handle them manually above)
        console.error("Validation failed:", error);
      });
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModalChangePassword = () => {
    changePasswordForm.resetFields();
    setIsChangePasswordModalVisible(true);
  };

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
          onError: (error) => {
            const errorObj = error as unknown as { responseValue: string };
            const errorMessage =
              errorObj.responseValue || "Thay đổi mật khẩu thất bại";
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
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const handleChangePasswordCancel = () => {
    setIsChangePasswordModalVisible(false);
    changePasswordForm.resetFields();
  };

  const showEditContactModal = (contact: Contact) => {
    setSelectedContact(contact);
    editContactForm.setFieldsValue({
      name: contact.name,
      phone: contact.phone,
      address: contact.address,
    });
    setIsEditContactModalVisible(true);
  };

  const handleEditContactOk = () => {
    editContactForm.validateFields().then((values) => {
      if (selectedContact) {
        const updatedContacts = contacts.map((contact) =>
          contact.id === selectedContact.id
            ? { ...contact, ...values }
            : contact
        );
        setContacts(updatedContacts);
        setIsEditContactModalVisible(false);
        setSelectedContact(null);
        editContactForm.resetFields();
      }
    });
  };

  const handleEditContactCancel = () => {
    setIsEditContactModalVisible(false);
    setSelectedContact(null);
    editContactForm.resetFields();
  };

  const showOrderTrackingDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowOrderTracking(true);
    localStorage.setItem("showOrderTracking", JSON.stringify(true));
    localStorage.setItem("selectedOrder", JSON.stringify(orderId));
  };

  const handleBackToOrderHistory = () => {
    setShowOrderTracking(false);
    setSelectedOrderId(null);
    localStorage.setItem("showOrderTracking", JSON.stringify(false));
    localStorage.setItem("selectedOrder", JSON.stringify(null));
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
              onClick={handleMenuClick}
            >
              <Menu.Item key="1" className="menu-item">
                <span role="img" aria-label="profile">
                  <UserBoldIcon />
                </span>
                Thông tin thành viên
              </Menu.Item>
              {/* <Menu.Item key="2" className="menu-item">
                <span role="img" aria-label="order">
                  <SearchIcon />
                </span>
                Tra cứu đơn hàng
              </Menu.Item> */}
              <Menu.Item key="3" className="menu-item">
                <span role="img" aria-label="history">
                  <ContainerOutlined
                    style={{ fontSize: 20, color: "#2D1E1A" }}
                  />
                </span>
                Lịch sử mua hàng
              </Menu.Item>
              <Menu.Item key="4" className="menu-item">
                <span role="img" aria-label="address">
                  <PromotionIcon />
                </span>
                Ưu đãi
              </Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout
          style={{
            padding: "0 20px",
            background: "#fff7e6",
            borderRadius: 10,
          }}
        >
          <Content>
            {activePage === "1" && (
              <div className="content-col">
                <div className="content-header">Thông tin thành viên</div>
                <div className="qr-code-section">
                  <img
                    src={userProfile?.qrCode}
                    alt="QR Code"
                    className="qr-code"
                  />
                  <div className="qr-text">
                    <p>{userProfile?.user.phone_number || "0902346789"}</p>
                    {/* <p>
                      <strong>Hạng thành viên:</strong> Vàng
                    </p> */}
                    <p>
                      <strong>Điểm tích lũy:</strong>{" "}
                      {userProfile?.user.member_point || "0"} điểm
                    </p>
                    <p>
                      <strong>Điểm đã sử dụng:</strong> 0 điểm
                    </p>
                    <p>
                      <strong>Điểm còn lại:</strong> 0 điểm
                    </p>
                  </div>
                </div>

                <div className="contact-container">
                  <Row gutter={[16, 16]} justify="center">
                    {contacts.map((contact) => (
                      <Col
                        key={contact.id}
                        xs={24}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        span={12}
                      >
                        {/* {contact.isDefault && (
                          <div
                            style={{
                              fontWeight: 400,
                              fontSize: 15,
                              textAlign: "left",
                              color: "#78A243",
                              fontFamily: "Montserrat, sans-serif",
                            }}
                          >
                            Default
                          </div>
                        )} */}
                        <Card className={"contact-card"}>
                          <div className="edit-contact-icon">
                            <EditOutlined
                              style={{ fontSize: 18 }}
                              onClick={() => showEditContactModal(contact)}
                            />
                          </div>
                          <Text
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              color: "#2D1E1A",
                              fontSize: 17,
                              fontWeight: 600,
                            }}
                          >
                            {contact.name}
                          </Text>
                          <div style={{ marginTop: "5px" }}>
                            <Text
                              style={{
                                fontFamily: "Montserrat, sans-serif",
                                color: "#2d1e1a",
                                fontSize: 15,
                              }}
                            >
                              <span role="img" aria-label="phone">
                                <PhoneOutlined style={{ color: "#da7339" }} />
                              </span>{" "}
                              {contact.phone}
                            </Text>
                          </div>
                          <div style={{ marginTop: "5px" }}>
                            <Text
                              style={{
                                fontFamily: "Montserrat, sans-serif",
                                color: "#2d1e1a",
                                fontSize: 15,
                              }}
                            >
                              <span role="img" aria-label="location">
                                <LocationBoldIcon />
                              </span>{" "}
                              {contact.address}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            )}
            {activePage === "3" && (
              <>
                {!showOrderTracking ? (
                  <OrderHistorys onDetailClick={showOrderTrackingDetails} />
                ) : (
                  <OrderTracking
                    orderId={selectedOrderId ?? undefined}
                    onBackClick={handleBackToOrderHistory}
                  />
                )}
              </>
            )}
            {activePage === "4" && <Promotion />}
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
        visible={isEditContactModalVisible}
        onOk={handleEditContactOk}
        onCancel={handleEditContactCancel}
        okText="Cập nhật"
        cancelText="Hủy"
        footer={null}
        className="modal-edit-contact"
      >
        <Form
          form={editContactForm}
          layout="vertical"
          name="editContact"
          initialValues={{
            name: selectedContact?.name || "",
            phone: selectedContact?.phone || "",
            address: selectedContact?.address || "",
          }}
        >
          <div className="edit-title">Chỉnh sửa địa chỉ</div>
          <Divider
            style={{ borderTop: "1px solid #2D1E1A", margin: "12px 0" }}
          />
          <Form.Item
            name="name"
            label="Họ và tên*"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại*"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ*"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleEditContactOk}
              className="update-contact-btn"
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
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
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

export default UserInfomation;
