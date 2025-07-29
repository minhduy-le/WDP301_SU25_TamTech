import { Row, Col, Card, Typography, message } from "antd";
import "../style/UserInformation.css";
import { useEffect, useState } from "react";
import { useGetAddressUser } from "../hooks/locationsApi";
import { useAuthStore } from "../hooks/usersApi";
import LocationBoldIcon from "../components/icon/LocationBoldIcon";
import { PhoneOutlined, EditOutlined } from "@ant-design/icons";
import { useGetProfileUser } from "../hooks/profileApi";
import dayjs from "dayjs";

const { Text } = Typography;

interface Contact {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const UserInformation = () => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: userProfile } = useGetProfileUser(userId || 0);
  const { data: addressUser } = useGetAddressUser();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (addressUser && addressUser.length > 0) {
      const updatedContacts = addressUser.map((address, index) => ({
        id: index + 1,
        name: userProfile?.user.fullName || "Truong Quang Hieu Trung",
        phone: userProfile?.user.phone_number || "0888777888",
        address,
        isDefault: index === 0,
      }));
      setContacts(updatedContacts);
    }
  }, [addressUser, userProfile]);

  return (
    <div className="content-col">
      <div className="content-header">Thông tin thành viên</div>
      <div className="qr-code-section">
        {/* <img src={userProfile?.qrCode} alt="QR Code" className="qr-code" /> */}
        <div className="qr-text">
          <p>Họ tên: {userProfile?.user.fullName}</p>
          <p>Số điện thoại: {userProfile?.user.phone_number}</p>
          <p>Email: {userProfile?.user.email}</p>
          <p>
            Ngày sinh:{" "}
            {dayjs(userProfile?.user.date_of_birth).format("DD/MM/YYYY")}
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
              <Card
                className="contact-cards"
                style={{
                  border: "none",
                  borderRadius: 10,
                  boxShadow: "0 2px 8px #0000001a",
                  backgroundColor: "#efe6db",
                  padding: 15,
                  marginTop: 23,
                  textAlign: "left",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div className="edit-contact-icon">
                  <EditOutlined
                    style={{ fontSize: 18 }}
                    onClick={() =>
                      message.info(
                        "Chỉnh sửa địa chỉ không được xử lý ở đây, hãy sử dụng layout để mở modal"
                      )
                    }
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
                    <PhoneOutlined style={{ color: "#da7339" }} />{" "}
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
                    <LocationBoldIcon /> {contact.address}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default UserInformation;
