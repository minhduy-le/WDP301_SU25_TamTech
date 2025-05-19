import { Card, Button } from "antd";
import "../style/Menu.css";

const Menu = () => {
  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Thức đơn Tâm Tấc</h1>
        <p className="menu-subtitle">
          Tâm Tấc lựa chọn những món ăn ngon nhất để phục vụ bạn, tận tâm với
          từng món ăn, từng bữa ăn của bạn.
        </p>
      </div>
      <div className="menu-categories">
        <div className="category-item active">Thức đơn</div>
        <div className="category-item">. Cơm Tấm</div>
        <div className="category-item">. Món Gói Thêm</div>
        <div className="category-item">. Nước Giải Khát</div>
        <div className="category-item">Đánh số thứ tự hàng ▼</div>
      </div>
      <div className="menu-items">
        <div className="item-column">
          <div className="item-info">
            <p className="item-name">Thịnh Tầnh phở</p>
            <p className="item-name">Thịnh vụn ▼</p>
          </div>
          <div className="item-cards">
            <Card className="menu-card">
              <img
                src="https://via.placeholder.com/150x100"
                alt="Combo"
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">COMBO - SÁ BÍCHỦNG</h3>
                <p className="card-description">
                  - Cơm: sườn nướng, bí, chả trứng
                  <br />
                  - Cầnh thức ăn
                  <br />- Nước ngột tự chọn
                </p>
                <div className="card-price">99.000đ</div>
                <Button className="add-button">Thêm</Button>
              </div>
            </Card>
            <Card className="menu-card">
              <img
                src="https://via.placeholder.com/150x100"
                alt="Combo"
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">COMBO - SÁ BÍCHỦNG</h3>
                <p className="card-description">
                  - Cơm: sườn nướng, bí, chả trứng
                  <br />
                  - Cầnh thức ăn
                  <br />- Nước ngột tự chọn
                </p>
                <div className="card-price">99.000đ</div>
                <Button className="add-button">Thêm</Button>
              </div>
            </Card>
          </div>
        </div>
        <div className="item-column">
          <div className="item-info">
            <p className="item-name">Tâm Tấc Lăng Đại hộc</p>
            <p className="item-name">
              Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh
            </p>
          </div>
          <div className="item-cards">
            <Card className="menu-card">
              <img
                src="https://via.placeholder.com/150x100"
                alt="Combo"
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">COMBO - SÁ BÍCHỦNG</h3>
                <p className="card-description">
                  - Cơm: sườn nướng, bí, chả trứng
                  <br />
                  - Cầnh thức ăn
                  <br />- Nước ngột tự chọn
                </p>
                <div className="card-price">1000đ</div>
                <Button className="add-button">Thêm</Button>
              </div>
            </Card>
            <Card className="menu-card">
              <img
                src="https://via.placeholder.com/150x100"
                alt="Combo"
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">COMBO - SÁ BÍCHỦNG</h3>
                <p className="card-description">
                  - Cơm: sườn nướng, bí, chả trứng
                  <br />
                  - Cầnh thức ăn
                  <br />- Nước ngột tự chọn
                </p>
                <div className="card-price">1000đ</div>
                <Button className="add-button">Thêm</Button>
              </div>
            </Card>
          </div>
        </div>
        <div className="item-column">
          <div className="item-info">
            <p className="item-name">Tâm Tấc Lăng Đại hộc</p>
            <p className="item-name">
              Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh
            </p>
          </div>
          <div className="item-cards">
            <Card className="menu-card">
              <img
                src="https://via.placeholder.com/150x100"
                alt="Combo"
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">COMBO - SÁ BÍCHỦNG</h3>
                <p className="card-description">
                  - Cơm: sườn nướng, bí, chả trứng
                  <br />
                  - Cầnh thức ăn
                  <br />- Nước ngột tự chọn
                </p>
                <div className="card-price">99.000đ</div>
                <Button className="add-button">Thêm</Button>
              </div>
            </Card>
            <Card className="menu-card">
              <img
                src="https://via.placeholder.com/150x100"
                alt="Combo"
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">COMBO - SÁ BÍCHỦNG</h3>
                <p className="card-description">
                  - Cơm: sườn nướng, bí, chả trứng
                  <br />
                  - Cầnh thức ăn
                  <br />- Nước ngột tự chọn
                </p>
                <div className="card-price">1000đ</div>
                <Button className="add-button">Thêm</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
