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
        background: "linear-gradient(to bottom, #fff7e6, #78a243)",
        padding: "50px 20px",
        position: "relative",
        overflow: "hidden",
        paddingTop: "10px",
        paddingBottom: "40px",
      }}
    >
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
              style={{ 
                marginTop: "50px",
                width: "400px", 
                height: "400px",
                animation: "rotate 8s linear infinite",
                transformOrigin: "center center"
              }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Typography>
              <Title
                level={2}
                style={{
                  marginBottom: 16,
                  fontSize: 50,
                  fontWeight: "700",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                VỀ <span style={{ color: "#78a243" }}>TẤM </span><span style={{ color: "#da7339" }}>TẮC</span>
              </Title>
              <Paragraph
                style={{
                  color: "#fff",
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
                  color: "#fff",
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`}</style>
    </div>
  );
};

export default AboutUs;
