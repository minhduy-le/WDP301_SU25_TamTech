import { Layout, Divider } from "antd";
import { Link } from "react-router-dom";
import "../style/Footer.css";
import APP_LOGO_FOOTER from "../assets/logo-footer.png";
import LocationIcon from "./icon/LocationIcon";
import PhoneIcon from "./icon/PhoneIcon";
import MailIcon from "./icon/MailIcon";

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer
      style={{
        background: "#DA7339",
        padding: "70px 50px",
        color: "#fff",
        width: "100%",
        position: "absolute",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "0 20px",
        }}
      >
        <div style={{ alignContent: "center" }}>
          <img src={APP_LOGO_FOOTER} alt="Logo" />
        </div>
        <div style={{ textAlign: "left", paddingLeft: "20px", width: 210 }}>
          <h3 style={{ color: "#fff", fontSize: 20, margin: 0 }}>Thông tin</h3>
          <Divider
            style={{
              border: "1px solid white",
              marginTop: 7,
              marginBottom: 16,
            }}
          />
          <p>
            <Link to="/ve-tam-tac" style={{ color: "#fff" }}>
              Về Tâm Tác
            </Link>
          </p>
          <p>
            <Link to="/chuyen-com-tam" style={{ color: "#fff" }}>
              Chuyện Cơm Tâm
            </Link>
          </p>
        </div>
        <div style={{ textAlign: "left", paddingLeft: "20px", width: 210 }}>
          <h3 style={{ color: "#fff", fontSize: 20, margin: 0 }}>Dịch vụ</h3>
          <Divider
            style={{
              border: "1px solid white",
              marginTop: 7,
              marginBottom: 16,
            }}
          />
          <p>
            <Link to="/dat-hang" style={{ color: "#fff" }}>
              Đặt hàng
            </Link>
          </p>
          <p>
            <Link to="/nhuong-quyen" style={{ color: "#fff" }}>
              Nhượng quyền
            </Link>
          </p>
        </div>
        <div style={{ textAlign: "left", paddingLeft: "20px" }}>
          <h3 style={{ color: "#fff", fontSize: 20, margin: 0 }}>Liên hệ</h3>
          <Divider
            style={{
              border: "1px solid white",
              marginTop: 7,
              marginBottom: 16,
            }}
          />
          <p style={{ display: "flex", alignItems: "center" }}>
            <span
              role="img"
              aria-label="location"
              style={{ marginRight: 8, height: 21 }}
            >
              <LocationIcon />
            </span>{" "}
            Lô E2a-7, Đường D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh
          </p>
          <p style={{ display: "flex", alignItems: "center" }}>
            <span
              role="img"
              aria-label="phone"
              style={{ marginRight: 8, height: 19 }}
            >
              <PhoneIcon />
            </span>{" "}
            0902-123-456
          </p>
          <p style={{ display: "flex", alignItems: "center" }}>
            <span
              role="img"
              aria-label="email"
              style={{ marginRight: 8, height: 18 }}
            >
              <MailIcon />
            </span>{" "}
            cskh@tamtac.com
          </p>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;
