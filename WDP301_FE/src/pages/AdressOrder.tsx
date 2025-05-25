import { Row, Col, Card, Typography } from "antd";
import "../style/AddressOrder.css";

const { Text } = Typography;

const AddressOrder = () => {
  const contacts = [
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
  ];

  return (
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
                    📞
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
                    📍
                  </span>{" "}
                  {contact.address}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AddressOrder;
