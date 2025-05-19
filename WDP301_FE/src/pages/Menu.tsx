import { Card, Button, Row, Col } from "antd";
import "../style/Menu.css";

const Menu = () => {
  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Thức đơn Tâm Tấc</h1>
        <div className="menu-subtitle">
          <div className="title-orange">Tấm Tắc </div>{" "}
          <div>
            là chuỗi hệ thống cửa hàng cơm tấm với mong muốn mang đến cho sinh
            viên những bữa cơm tấm chất lượng với giá cả hợp lý, đảm bảo vệ sinh
            an toàn thực phẩm
          </div>
        </div>
      </div>
      <div className="menu-sell">
        <div className="menu-categories">
          <div className="category-item father">Thực đơn</div>
          <div className="category-item active">. Cơm Tấm</div>
          <div className="category-item">. Món Gọi Thêm</div>
          <div className="category-item">. Nước Giải Khát</div>
        </div>
        <div className="menu-items">
          <Row gutter={[20, 20]}>
            <Col span={11} className="menu-column">
              <Card className="menu-card">
                <div className="card-image-container">
                  <img
                    src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                    alt="Combo"
                    className="card-image"
                  />
                  <div className="card-rating">
                    <span className="card-rating-star">★</span>
                    <span>1000+</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
                  <p className="card-description">
                    - Cơm: sườn nướng, bì, chả trứng
                    <br />
                    - Canh rau củ
                    <br />- Nước ngọt tự chọn
                  </p>
                  <div className="card-price-container">
                    <div className="card-price">99.000đ</div>
                    <Button className="add-button">Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={11} className="menu-column">
              <Card className="menu-card">
                <div className="card-image-container">
                  <img
                    src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                    alt="Combo"
                    className="card-image"
                  />
                  <div className="card-rating">
                    <span className="card-rating-star">★</span>
                    <span>1000+</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
                  <p className="card-description">
                    - Cơm: sườn nướng, bì, chả trứng
                    <br />
                    - Canh rau củ
                    <br />- Nước ngọt tự chọn
                  </p>
                  <div className="card-price-container">
                    <div className="card-price">99.000đ</div>
                    <Button className="add-button">Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={11} className="menu-column">
              <Card className="menu-card">
                <div className="card-image-container">
                  <img
                    src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                    alt="Combo"
                    className="card-image"
                  />
                  <div className="card-rating">
                    <span className="card-rating-star">★</span>
                    <span>1000+</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
                  <p className="card-description">
                    - Cơm: sườn nướng, bì, chả trứng
                    <br />
                    - Canh rau củ
                    <br />- Nước ngọt tự chọn
                  </p>
                  <div className="card-price-container">
                    <div className="card-price">1000đ</div>
                    <Button className="add-button">Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={11} className="menu-column">
              <Card className="menu-card">
                <div className="card-image-container">
                  <img
                    src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                    alt="Combo"
                    className="card-image"
                  />
                  <div className="card-rating">
                    <span className="card-rating-star">★</span>
                    <span>1000+</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
                  <p className="card-description">
                    - Cơm: sườn nướng, bì, chả trứng
                    <br />
                    - Canh rau củ
                    <br />- Nước ngọt tự chọn
                  </p>
                  <div className="card-price-container">
                    <div className="card-price">1000đ</div>
                    <Button className="add-button">Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={11} className="menu-column">
              <Card className="menu-card">
                <div className="card-image-container">
                  <img
                    src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                    alt="Combo"
                    className="card-image"
                  />
                  <div className="card-rating">
                    <span className="card-rating-star">★</span>
                    <span>1000+</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
                  <p className="card-description">
                    - Cơm: sườn nướng, bì, chả trứng
                    <br />
                    - Canh rau củ
                    <br />- Nước ngọt tự chọn
                  </p>
                  <div className="card-price-container">
                    <div className="card-price">99.000đ</div>
                    <Button className="add-button">Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={11} className="menu-column">
              <Card className="menu-card">
                <div className="card-image-container">
                  <img
                    src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                    alt="Combo"
                    className="card-image"
                  />
                  <div className="card-rating">
                    <span className="card-rating-star">★</span>
                    <span>1000+</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
                  <p className="card-description">
                    - Cơm: sườn nướng, bì, chả trứng
                    <br />
                    - Canh rau củ
                    <br />- Nước ngọt tự chọn
                  </p>
                  <div className="card-price-container">
                    <div className="card-price">1000đ</div>
                    <Button className="add-button">Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col className="button-show-more">
              {" "}
              <Button className="custom-button">
                Hiển Thị Thêm XX Sản Phẩm
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Menu;
