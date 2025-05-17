import "./DrinksCollection.css";

interface Drink {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
}

const drinks: Drink[] = [
  {
    id: 1,
    name: "Trà Đào Cam Sả",
    image: "https://gachaybo.com/wp-content/uploads/2021/06/tra-dao-cam-sa.jpg",
    description: "Vị ngọt thanh, thơm mát",
    price: 35000,
  },
  {
    id: 2,
    name: "Trà Sữa Trân Châu",
    image: "https://file.huengaynay.vn/data2/image/news/2022/20220817/origin/1811660739183.jpg",
    description: "Béo ngậy, topping ngập tràn",
    price: 40000,
  },
  {
    id: 3,
    name: "Soda Việt Quất",
    image: "https://file.hstatic.net/200000528965/file/ruot-cai-thien-cac-van-de-ve-tieu-hoa_519e7933a481436a9a460b5cdfbfae27_grande.jpg",
    description: "Chua nhẹ, thơm vị trái cây",
    price: 32000,
  },
  {
    id: 2,
    name: "Nước sâm",
    image: "https://static.gia-hanoi.com/uploads/2024/05/nau-nuoc-sam-bi-dao.jpg",
    description: "Thanh mát, ngọt dịu",
    price: 15000,
  },
];

const DrinksCollection = () => {
  return (
    <section className="drinks-collection">
      <h2 className="section-title">DRINKS COLLECTION</h2>
      <div className="drinks-grid">
        {drinks.map((drink) => (
          <div key={drink.id} className="drink-card">
            <img src={drink.image} alt={drink.name} />
            <div className="drink-content">
              <h3>{drink.name}</h3>
              {drink.description && <p>{drink.description}</p>}
              <div className="price-button">
                <span className="drink-price">{drink.price.toLocaleString()}đ</span>
                <button>Thêm</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DrinksCollection;
