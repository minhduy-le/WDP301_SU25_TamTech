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
    <Footer>
      <div className="footer-container">
        <div className="footer-image">
          <img src={APP_LOGO_FOOTER} alt="Logo" />
        </div>
        <div className="footer-information">
          <h3>Thông tin</h3>
          <Divider className="footer-divider" />
          <p>
            <Link to="/ve-tam-tac">Về Tấm Tắc</Link>
          </p>
          <p>
            <Link to="/chuyen-com-tam">Chuyện Cơm Tấm</Link>
          </p>
        </div>
        <div className="footer-information">
          <h3>Dịch vụ</h3>
          <Divider className="footer-divider" />
          <p>
            <Link to="/dat-hang">Đặt hàng</Link>
          </p>
          <p>
            <Link to="/nhuong-quyen">Nhượng quyền</Link>
          </p>
        </div>
        <div className="footer-contact">
          <h3>Liên hệ</h3>
          <Divider className="footer-divider" />
          <p className="footer-contact-item">
            <span role="img" aria-label="location">
              <LocationIcon />
            </span>{" "}
            Lô E2a-7, Đường D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh
          </p>
          <p className="footer-contact-item">
            <span role="img" aria-label="phone">
              <PhoneIcon />
            </span>{" "}
            0902-123-456
          </p>
          <p className="footer-contact-item">
            <span role="img" aria-label="email">
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
