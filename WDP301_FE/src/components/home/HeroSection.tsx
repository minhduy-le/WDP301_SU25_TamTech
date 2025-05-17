import { Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./HeroSection.css";

const { Option } = Select;

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          Cơm Tấm Tắc <br />
          <span>
            Tấm ngon, <span className="highlight">Tắc nhớ!</span>
          </span>
        </h1>
        <p className="hero-desc">
          Thương hiệu cơm tấm hàng đầu dành cho sinh viên
        </p>
        <div className="hero-form">
          <Select
            defaultValue="Chọn cửa hàng"
            suffixIcon={<DownOutlined style={{ color: "#F9A14D" }} />}
            style={{
              minWidth: 170,
              background: "#fff",
              borderColor: "#F9A14D",
              color: "#a05a13",
            }}
            popupClassName="custom-ant-select-dropdown"
            className="custom-ant-select"
          >
            <Option disabled>Chọn cửa hàng</Option>
            <Option value="Cửa hàng 1">Cửa hàng 1</Option>
            <Option value="Cửa hàng 2">Cửa hàng 2</Option>
          </Select>
          <div className="address-input-group">
            <input type="text" placeholder="Địa chỉ giao hàng" />
            <button type="button" className="location-btn">
              Vị trí hiện tại
            </button>
          </div>
          <button className="confirm-btn">Xác nhận</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
