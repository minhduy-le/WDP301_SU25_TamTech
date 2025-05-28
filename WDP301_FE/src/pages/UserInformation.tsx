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
} from "antd";
import "../style/UserInformation.css";
import { useEffect, useState } from "react";
import OrderTracking from "./OrderTracking";
import OrderHistory from "./OrderHistory";
import UserBoldIcon from "../components/icon/UserBoldIcon";
import {
  ContainerOutlined,
  EditOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import PromotionIcon from "../components/icon/PromotionIcon";
import Promotion from "./Promotion";
import { useLocation, useNavigationType } from "react-router-dom";
import { useAuthStore } from "../hooks/usersApi";
import LocationBoldIcon from "../components/icon/LocationBoldIcon";
import { useGetProfileUser, useUpdateProfile } from "../hooks/profileApi";
import "../style/AddressOrder.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

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

// const contacts = [
//   {
//     id: 1,
//     name: "Truong Quang Hieu Trung",
//     phone: "0888777888",
//     address:
//       "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
//     isDefault: false,
//   },
//   {
//     id: 2,
//     name: "Truong Quang Hieu Trung",
//     phone: "0888777888",
//     address:
//       "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
//     isDefault: false,
//   },
//   {
//     id: 3,
//     name: "Truong Quang Hieu Trung",
//     phone: "0888777888",
//     address:
//       "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
//     isDefault: true,
//   },
//   {
//     id: 4,
//     name: "Truong Quang Hieu Trung",
//     phone: "0888777888",
//     address:
//       "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
//     isDefault: false,
//   },
// ];

const UserInfomation = () => {
  const [activePage, setActivePage] = useState("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditContactModalVisible, setIsEditContactModalVisible] =
    useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "Truong Quang Hieu Trung",
      phone: "0888777888",
      address:
        "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
      isDefault: false,
    },
    {
      id: 2,
      name: "Truong Quang Hieu Trung",
      phone: "0888777888",
      address:
        "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
      isDefault: false,
    },
    {
      id: 3,
      name: "Truong Quang Hieu Trung",
      phone: "0888777888",
      address:
        "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
      isDefault: true,
    },
    {
      id: 4,
      name: "Truong Quang Hieu Trung",
      phone: "0888777888",
      address:
        "Lô E2a-7, Đường D1, Long Thanh My, Thành Phố Thủ Đức, Hồ Chí Minh",
      isDefault: false,
    },
  ]);
  const [form] = Form.useForm();
  const [editContactForm] = Form.useForm();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data: userProfile, refetch } = useGetProfileUser(userId || 0);
  const { mutate: updateProfile } = useUpdateProfile();

  const [showOrderTracking, setShowOrderTracking] = useState<boolean>(() => {
    const savedState = localStorage.getItem("showOrderTracking");
    return savedState ? JSON.parse(savedState) : false;
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    return localStorage.getItem("selectedOrderId") || null;
  });

  const handleMenuClick = (e: { key: string }) => {
    setActivePage(e.key);
    localStorage.setItem("userInfoActiveTab", e.key);
    if (e.key === "3") {
      const savedState = localStorage.getItem("showOrderTracking");
      const savedOrderId = localStorage.getItem("selectedOrderId");
      setShowOrderTracking(savedState ? JSON.parse(savedState) : false);
      setSelectedOrderId(savedOrderId || null);
    } else {
      setShowOrderTracking(false);
      setSelectedOrderId(null);
      localStorage.setItem("showOrderTracking", JSON.stringify(false));
      localStorage.setItem("selectedOrderId", "");
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
        localStorage.setItem("selectedOrderId", "");
      } else if (savedTab) {
        setActivePage(savedTab);
        if (savedTab === "3") {
          const savedState = localStorage.getItem("showOrderTracking");
          const savedOrderId = localStorage.getItem("selectedOrderId");
          setShowOrderTracking(savedState ? JSON.parse(savedState) : false);
          setSelectedOrderId(savedOrderId || null);
        } else {
          setShowOrderTracking(false);
          setSelectedOrderId(null);
          localStorage.setItem("showOrderTracking", JSON.stringify(false));
          localStorage.setItem("selectedOrderId", "");
        }
      } else {
        setActivePage("1");
        localStorage.setItem("userInfoActiveTab", "1");
        setShowOrderTracking(false);
        setSelectedOrderId(null);
        localStorage.setItem("showOrderTracking", JSON.stringify(false));
        localStorage.setItem("selectedOrderId", "");
      }
    }
  }, [location.pathname, navigationType]);

  const showModal = () => {
    form.setFieldsValue({
      fullName: userProfile?.fullName || "",
      dateOfBirth: userProfile?.date_of_birth
        ? dayjs(userProfile.date_of_birth, "YYYY-MM-DD")
        : null,
      phoneNumber: userProfile?.phone_number || "",
      email: userProfile?.email || "",
    });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      updateProfile(
        {
          id: userId || 0,
          data: values,
        },
        {
          onSuccess: () => {
            refetch();
            setIsModalVisible(false);
          },
          onError: (error) => {
            console.error("Update failed:", error);
          },
        }
      );
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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

  const showOrderTrackingDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderTracking(true);
    localStorage.setItem("showOrderTracking", JSON.stringify(true));
    localStorage.setItem("selectedOrderId", orderId);
  };

  return (
    <div className="user-info-container">
      <Layout style={{ minHeight: "510px", background: "#fff7e6" }}>
        <Sider className="user-sider">
          <div className="user-details">
            <p className="user-name">
              {userProfile?.fullName || "Dummy Tester VietNamese"}
            </p>
            <p className="user-email">
              {userProfile?.phone_number || "0902346789"}
            </p>
            <p className="user-email">
              {userProfile?.email || "dummytestervietnamese@gmail.com"}
            </p>
            <div className="edit" onClick={showModal}>
              <EditOutlined style={{ color: "#da7339" }} />
              <div className="edit-profile">Chỉnh sửa</div>
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
                    src="https://via.placeholder.com/150x150"
                    alt="QR Code"
                    className="qr-code"
                  />
                  <div className="qr-text">
                    <p>0902346789</p>
                    <p>
                      <strong>Hạng thành viên:</strong> Vàng
                    </p>
                    <p>
                      <strong>Điểm tích lũy:</strong>{" "}
                      {userProfile?.member_point || "100 điểm"}
                    </p>
                    <p>
                      <strong>Điểm đã sử dụng:</strong> 0 điểm
                    </p>
                    <p>
                      <strong>Điểm còn lại:</strong> 100 điểm
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
                        {contact.isDefault && (
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
                        )}
                        <Card
                          className={`contact-card ${
                            contact.isDefault ? "default-card" : ""
                          }`}
                        >
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
                  <OrderHistory onDetailClick={showOrderTrackingDetails} />
                ) : (
                  <OrderTracking orderId={selectedOrderId || undefined} />
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
          form={form}
          layout="vertical"
          name="updateProfile"
          initialValues={{
            fullName: userProfile?.fullName || "",
            dateOfBirth: userProfile?.date_of_birth
              ? dayjs(userProfile.date_of_birth, "YYYY-MM-DD")
              : null,
            phoneNumber: userProfile?.phone_number || "",
            email: userProfile?.email || "",
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
            name="dateOfBirth"
            label="Ngày sinh*"
            rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại*"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ!" }]}
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
    </div>
  );
};

export default UserInfomation;
