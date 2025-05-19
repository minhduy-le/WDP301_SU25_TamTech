import { Row, Col, Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const AboutUs = () => {
  return (
    <div style={{ 
      backgroundColor: '#78a243', 
      padding: '50px 20px', 
      position: 'relative', 
      overflow: 'hidden', 
      paddingTop: '20px'
    }}>
      <svg 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.08, zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <Card 
        style={{ 
          background: 'transparent', 
          border: 'none', 
          position: 'relative', 
          zIndex: 1, 
        }}
      >
        <Row gutter={[48, 48]} align="middle" justify="center">
          <Col xs={24} md={8}>
            <div style={{ position: 'relative', width: '100%', height: 300 }}>
              <img
                src="https://izitour.com/media/ckeditor/traditional-vietnamese-food-com-tam_2024-05-30_825.webp"
                alt="Circle 1"
                style={{
                  position: 'absolute',
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  left: 0,
                  top: 60,
                  border: '4px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
              />
              <img
                src="https://izitour.com/media/ckeditor/traditional-vietnamese-food-com-tam_2024-05-30_825.webp"
                alt="Circle 2"
                style={{
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  left: 200,
                  top: 0,
                  border: '4px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
              />
              <img
                src="https://izitour.com/media/ckeditor/traditional-vietnamese-food-com-tam_2024-05-30_825.webp"
                alt="Circle 3"
                style={{
                  position: 'absolute',
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  left: 200,
                  top: 200,
                  border: '4px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Typography>
              <Title level={2} style={{ color: '#efe6db', marginBottom: 16, fontSize: 50, fontWeight: '700' }}>
                Về Tấm Tắc
              </Title>
              <Paragraph style={{ color: '#efe6db', fontSize: 16, lineHeight: 1.8 }}>
              Cơm tấm là linh hồn của ẩm thực Sài Gòn – và tụi mình đem hương vị ấy vào từng dĩa cơm. Với bí quyết riêng trong cách ướp sườn, nước mắm pha chuẩn vị và chén mỡ hành thơm lừng, tụi mình mong muốn mang đến cho bạn một bữa ăn thật trọn vẹn và đậm đà.              </Paragraph>
              <Paragraph style={{ color: '#efe6db', fontSize: 16, lineHeight: 1.8 }}>
              Không chỉ là món ăn, tụi mình còn phục vụ bằng cả tấm lòng – vì "Ngon thôi chưa đủ, phải vui vẻ nữa mới đúng vị!"              </Paragraph>
            </Typography>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AboutUs;
