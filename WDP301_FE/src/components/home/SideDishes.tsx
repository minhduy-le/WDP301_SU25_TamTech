import "./SideDishes.css";
interface SideDish {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
}

const sideDishes: SideDish[] = [
  {
    id: 1,
    name: "Canh Rong Biển",
    image: "https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/11/cach-lam-canh-rong-bien-nau-tom-mon-chinh-954333940591.jpg",
    description: "Giải nhiệt, bổ dưỡng",
    price: 15000,
  },
  {
    id: 2,
    name: "Chả Trứng",
    image: "https://cdn.tgdd.vn/Files/2018/01/29/1062867/cach-lam-cha-trung-hap-don-gian-tai-nha-202203041434088984.jpg",
    description: "Béo thơm, mềm mịn",
    price: 12000,
  },
  {
    id: 3,
    name: "Rau Luộc Chấm Kho Quẹt",
    image: "https://file.hstatic.net/200000385717/article/ia-chi-ban-com-chay-kho-quet-can-tho-duoc-yeu-thich-nhat-07-1649155337_2f52b84169dd496c8c30794a1d1d556d.jpg",
    description: "Đậm đà hương vị quê",
    price: 18000,
  },
  {
    id: 4,
    name: "Đồ Chua",
    image: "https://www.seriouseats.com/thmb/v0epZZi6W-RBZlA0rxi81OB-HBI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20230712-SEA-DoChua-MaureenCelestine-hero-fc08b05e43f0470aa611993727f8e2e9.jpg",
    description: "Chua ngọt, tươi mát",
    price: 10000,
  },
];

const SideDishes = () => {
  return (
    <section className="side-dishes-collection">
      <h2 className="section-title">SIDE DISHES</h2>
      <div className="dishes-grid">
        {sideDishes.map((dish) => (
          <div key={dish.id} className="dish-card">
            <img src={dish.image} alt={dish.name} />
            <div className="dish-content">
              <h3>{dish.name}</h3>
              {dish.description && <p>{dish.description}</p>}
              <div className="price-button">
                <span className="dish-price">{dish.price.toLocaleString()}đ</span>
                <button>Thêm</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SideDishes;
