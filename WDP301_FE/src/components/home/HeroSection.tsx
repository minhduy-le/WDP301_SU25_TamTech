import { useState, useEffect } from "react";
import { Select, Input, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./HeroSection.css";

const { Option } = Select;

const demoImages = [
  "https://izitour.com/media/ckeditor/traditional-vietnamese-food-com-tam_2024-05-30_825.webp",
  "https://mia.vn/media/uploads/blog-du-lich/com-tam-sai-gon-12-1693583366.jpg",
  "https://cdn.tgdd.vn/2020/10/CookProduct/3-cach-lam-salad-ot-chuong-ngon-mieng-don-gian-de-lam-giup-CN-1200x676-1.jpg", // And another one
];

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === demoImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-carousel-background">
        {demoImages.map((imgSrc, index) => (
          <div
            key={imgSrc}
            className={`hero-bg-image ${
              index === currentImageIndex ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${imgSrc})` }}
          ></div>
        ))}
      </div>

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
        <div
          className="hero-form"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <Select
            defaultValue="Chọn cửa hàng"
            suffixIcon={<DownOutlined style={{ color: "#F9A14D" }} />}
            style={{
              width: 150,
              height: 40,
              background: "#fff",
              borderColor: "#F9A14D",
              color: "#a05a13",
              fontFamily: "'Montserrat', sans-serif",
            }}
            popupClassName="custom-ant-select-dropdown"
            className="custom-ant-select"
          >
            <Option disabled value="Chọn cửa hàng">
              Chọn cửa hàng
            </Option>
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
              fontFamily: "'Montserrat', sans-serif",
            }}
          />
          <Button
            style={{
              height: 40,
              background: "#F9A14D",
              border: "none",
              color: "#fff",
              alignItems: "center",
              outline: "none",
              fontFamily: "'Montserrat', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#fb923c";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#f97316";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
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
