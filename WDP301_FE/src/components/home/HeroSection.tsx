import { Select, Input, Button } from "antd";
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
        <div className="hero-form" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Select
            defaultValue="Chọn cửa hàng"
            suffixIcon={<DownOutlined style={{ color: "#F9A14D" }} />}
            style={{
              width: 150,
              height: 40,
              background: "#fff",
              borderColor: "#F9A14D",
              borderRadius: 10,
              color: "#a05a13",
            }}
            popupClassName="custom-ant-select-dropdown"
            className="custom-ant-select"
          >
            <Option disabled value="Chọn cửa hàng">Chọn cửa hàng</Option>
            <Option value="Cửa hàng 1">Cửa hàng 1</Option>
            <Option value="Cửa hàng 2">Cửa hàng 2</Option>
          </Select>
          <Input
            placeholder="Địa chỉ giao hàng"
            style={{
              width: 200,
              height: 40,
              borderColor: "#F9A14D",
              background: "#fff",
              color: "#a05a13",
            }}
          />
          <Button
            style={{
              height: 40,
              background: "#fff",
              borderColor: "#F9A14D",
              color: "#a05a13",
            }}
          >
            Vị trí hiện tại
          </Button>
          <Button
            style={{
              height: 40,
              background: "#F9A14D",
              border: "none",
              color: "#fff",
            }}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;