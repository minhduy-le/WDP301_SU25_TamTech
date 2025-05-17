import { useState } from "react";
import "./BestSellers.css";

interface Product {
  id: number;
  image: string;
  title: string;
  description: string | string[];
  price: number;
  originalPrice?: number;
  quantity?: number;
}

const bestSellers: Product[] = [
  {
    id: 1,
    image: "https://congthucgiadinh.com/storage/47/01J2JHNWAAKNAJD3J8Z561DHA2.jpg",
    title: "CƠM SƯỜN NƯỚNG MỀM",
    description: "Sườn nướng mềm mọng, dùng cùng cơm nóng và rau chua",
    price: 99900,
    originalPrice: 123000,
    quantity: 1,
  },
  {
    id: 2,
    image: "https://congthucgiadinh.com/storage/47/01J2JHNWAAKNAJD3J8Z561DHA2.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 99900,
  },
  {
    id: 3,
    image: "https://congthucgiadinh.com/storage/47/01J2JHNWAAKNAJD3J8Z561DHA2.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 99900,
  },
];

const BestSellers = () => {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({
    1: 1,
  });

  const updateQuantity = (id: number, amount: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + amount),
    }));
  };

  return (
    <section className="best-sellers-section">
      <h2 className="section-title">BEST SELLERS</h2>
      <div className="product-grid">
        {bestSellers.map((product) => (
          <div key={product.id} className="product-card">
            <div className="image-container">
              <img src={product.image} alt={product.title} />
              <span className="badge">★ 1000+</span>
            </div>
            <div className="card-content">
              <h3 className="product-title">{product.title}</h3>
              {typeof product.description === "string" ? (
                <p className="product-desc">{product.description}</p>
              ) : (
                <ul className="product-desc">
                  {product.description.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              )}
              <div className="price-row">
                <span className="price">{product.price.toLocaleString()}đ</span>
                {product.originalPrice && (
                  <span className="original-price">
                    {product.originalPrice.toLocaleString()}đ
                  </span>
                )}
              </div>

              {product.originalPrice ? (
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(product.id, -1)}>-</button>
                  <span>{quantities[product.id]}</span>
                  <button onClick={() => updateQuantity(product.id, 1)}>+</button>
                </div>
              ) : (
                <button className="add-button">Thêm</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
