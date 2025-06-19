import { useState, useEffect } from "react";
import { Button, AutoComplete, Spin, Input } from "antd";
import "./HeroSection.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const demoImages = [
  "https://izitour.com/media/ckeditor/traditional-vietnamese-food-com-tam_2024-05-30_825.webp",
  "https://mia.vn/media/uploads/blog-du-lich/com-tam-sai-gon-12-1693583366.jpg",
  "https://cdn.tgdd.vn/2020/10/CookProduct/3-cach-lam-salad-ot-chuong-ngon-mieng-don-gian-de-lam-giup-CN-1200x676-1.jpg", // And another one
];

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === demoImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Hàm gọi API khi nhập
  const handleSearch = async (value: string) => {
    setSearchValue(value);
    if (!value) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `https://wdp301-su25.space/api/products/search?name=${encodeURIComponent(
          value
        )}`
      );
      const products = res.data.products || [];
      setOptions(
        products.map((item: any) => ({
            value: item.name,
            id: item.productId,
            label: (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: 32,
                  height: 32,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <span>{item.name}</span>
            </div>
          ),
        }))
      );
    } catch (err) {
      setOptions([]);
    }
    setLoading(false);
  };

  const handleSelect = (_value: string, options: any) => {
    navigate(`/product/${options.id} `);
  };

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
          <AutoComplete
            style={{
              width: "470px",
              height: 40,
              background: "#fdf7f2",
              color: "#5c3d00",
              fontFamily: "'Montserrat', sans-serif",
              border: "1.5px solid #ffa94d",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            dropdownStyle={{
              borderRadius: "8px",
            }}
            popupMatchSelectWidth={false}
            options={options}
            onSearch={handleSearch}
            value={searchValue}
            
            onChange={setSearchValue}
            allowClear
            notFoundContent={
              loading ? <Spin size="small" /> : "Không tìm thấy món nào"
            }
            placeholder="Bạn muốn ăn gì?"
            children={
              <Input
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#5c3d00",
                  paddingLeft: "10px",
                  boxShadow: "none",
                }}
              />
            }
            onSelect={handleSelect}
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
            onClick={() => handleSelect(searchValue, options)}
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
            Tìm kiếm
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
