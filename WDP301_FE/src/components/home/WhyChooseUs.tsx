import "./WhyChooseUs.css";

const features = [
  {
    image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474725lIf/nuoc-mam-com-tam-1.jpg",
    title: "NGUYÊN LIỆU TƯƠI NGON",
    subtitle: "– AN TOÀN",
  },
  {
    image: "https://static.vinwonders.com/production/Com-tam-Nha-Trang-23-1.jpeg",
    title: "CÔNG THỨC ƯỚP ĐỘC QUYỀN,",
    subtitle: "NGON CHUẨN VỊ",
  },
  {
    image: "https://expleo.co.nz/cdn/shop/products/100600147.jpg?v=1584848322",
    title: "GIÁ CẢ PHẢI CHĂNG",
    subtitle: "",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-section">
      <h2 className="why-title">
        TẠI SAO CHỌN CƠM <span className="highlight-orange">TẤM</span>
        <span className="highlight-green"> TẮC</span>?
      </h2>
      <div className="features-grid">
        {features.map((item, index) => (
          <div key={index} className="feature-card">
            <img src={item.image} alt={item.title} className="feature-image" />
            <h3 className="feature-title">{item.title}</h3>
            {item.subtitle && <p className="feature-subtitle">{item.subtitle}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
