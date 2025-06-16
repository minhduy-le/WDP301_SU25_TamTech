import { Row, Col, Typography, Card, Button } from "antd";

const { Title, Paragraph } = Typography;
import logoFooter from "../../assets/comtam.png";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        backgroundColor: "#78a243",
        padding: "50px 20px",
        position: "relative",
        overflow: "hidden",
        paddingTop: "20px",
      }}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.08,
          zIndex: 0,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <Card
        style={{
          background: "transparent",
          border: "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Row gutter={[48, 48]} align="middle" justify="center">
          <Col xs={24} md={8}>
            <img
              src={logoFooter}
              alt="About Us"
              style={{ width: "350px", height: "350px" }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Typography>
              <Title
                level={2}
                style={{
                  color: "#efe6db",
                  marginBottom: 16,
                  fontSize: 50,
                  fontWeight: "700",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Về Tấm Tắc
              </Title>
              <Paragraph
                style={{
                  color: "#efe6db",
                  fontSize: 16,
                  lineHeight: 1.8,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Cơm tấm là linh hồn của ẩm thực Sài Gòn – và tụi mình đem hương
                vị ấy vào từng dĩa cơm. Với bí quyết riêng trong cách ướp sườn,
                nước mắm pha chuẩn vị và chén mỡ hành thơm lừng, tụi mình mong
                muốn mang đến cho bạn một bữa ăn thật trọn vẹn và đậm đà.{" "}
              </Paragraph>
              <Paragraph
                style={{
                  color: "#efe6db",
                  fontSize: 16,
                  lineHeight: 1.8,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Không chỉ là món ăn, tụi mình còn phục vụ bằng cả tấm lòng, vì
                "Ngon thôi chưa đủ, phải vui vẻ nữa mới đúng vị!"{" "}
              </Paragraph>
            </Typography>
            <Button
              type="primary"
              style={{
                background: "linear-gradient(90deg, #e6f4ea, #f9e4b7, #e6f4ea)",
                backgroundSize: "200% 200%",
                color: "#78a243",
                border: "none",
                borderRadius: 12,
                marginTop: 20,
                width: "50%",
                height: "50px",
                fontSize: 18,
                fontWeight: 700,
                outline: "none",
                boxShadow: "0 4px 16px rgba(120, 162, 67, 0.10)",
                cursor: "pointer",
                transition:
                  "transform 0.2s, box-shadow 0.2s, background-position 0.5s",
                animation: "gradientMove 2s linear infinite",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Montserrat', sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1.07)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 24px #b7e4c7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 16px rgba(120, 162, 67, 0.10)";
              }}
              onClick={() => navigate("/menu")}
            >
              Khám phá Menu <ArrowRightOutlined />
            </Button>
          </Col>
        </Row>
      </Card>
      <style>{`
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`}</style>
    </div>
  );
};

export default AboutUs;
