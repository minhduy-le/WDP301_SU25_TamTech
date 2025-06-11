# Dự án "Tấm Tắc" - WDP301_SU25_TamTech

[![Deploy Backend](https://github.com/minhduy-le/WDP301_SU25_TamTech/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/minhduy-le/WDP301_SU25_TamTech/actions/workflows/deploy-backend.yml)

[![Deploy Frontend](https://github.com/minhduy-le/WDP301_SU25_TamTech/actions/workflows/deploy-front-end.yml/badge.svg)](https://github.com/minhduy-le/WDP301_SU25_TamTech/actions/workflows/deploy-front-end.yml)

Chào mừng đến với **Tấm Tắc** - dự án cuối kỳ môn **WDP301** của team **TamTech**. Tấm Tắc là một hệ thống đặt và giao hàng Cơm Tấm trực tuyến, bao gồm một ứng dụng di động cho khách hàng và một trang web quản lý cho chủ cửa hàng.

## 📝 Giới thiệu dự án

Mục tiêu của dự án là xây dựng một nền tảng hoàn chỉnh, giúp các cửa hàng Cơm Tấm có thể dễ dàng quản lý hoạt động kinh doanh và tiếp cận nhiều khách hàng hơn thông qua kênh online. Đồng thời, mang đến cho thực khách một trải nghiệm đặt món tiện lợi, nhanh chóng.

Hệ thống bao gồm 2 thành phần chính:

- **Ứng dụng Mobile (cho khách hàng)**: Cho phép người dùng xem thực đơn, đặt món, theo dõi đơn hàng và thanh toán.
- **Ứng dụng Web (cho quản trị viên)**: Cung cấp các công cụ để quản lý món ăn, đơn hàng, khách hàng và xem báo cáo kinh doanh.

## ✨ Tính năng chính

### 📱 Đối với khách hàng (Mobile App)

- [x] Đăng ký, đăng nhập tài khoản.
- [x] Xem danh sách món ăn, chi tiết món ăn.
- [x] Tìm kiếm món ăn.
- [x] Thêm/xóa món ăn vào giỏ hàng.
- [x] Đặt hàng và lựa chọn phương thức thanh toán (VD: Tiền mặt khi nhận hàng - COD).
- [x] Xem lại lịch sử và trạng thái đơn hàng.
- [x] Quản lý thông tin cá nhân.

### 💻 Đối với quản trị viên (Web App)

- [x] Dashboard tổng quan về doanh thu, số lượng đơn hàng.
- [x] Quản lý Món ăn (Thêm, sửa, xóa, cập nhật trạng thái).
- [x] Quản lý Đơn hàng (Xác nhận, chuẩn bị, giao hàng, hủy đơn).
- [x] Quản lý Người dùng/Khách hàng.
- [x] Xem báo cáo, thống kê.

## 🚀 Công nghệ sử dụng

| Thành phần                | Công nghệ             |
| :------------------------ | :-------------------- |
| **Backend**               | `Node Js`             |
| **Frontend (Web Admin)**  | `React Js Typescript` |
| **Mobile (Customer App)** | `React Native`        |
| **Database**              | `Mysql`               |
| **Deployment**            | `Google Cloud Ubuntu` |
| **CI/CD**                 | GitHub Actions        |

## 🛠️ Hướng dẫn cài đặt và chạy dự án

### Yêu cầu

- `[Node.js >= 18.x, npm/yarn, Android Studio/Xcode]`

### Cài đặt

1.  Clone repository về máy của bạn:
    ```bash
    git clone https://github.com/minhduy-le/WDP301_SU25_TamTech.git
    ```
2.  Di chuyển vào thư mục dự án:
    ```bash
    cd WDP301_SU25_TamTech
    ```

### Chạy Backend

```bash
# Di chuyển vào thư mục backend
cd WDP301-Backend

# Cài đặt các dependencies
npm install

# Tạo file .env và cấu hình các biến môi trường (database, secret keys,...)
# Bạn có thể tham khảo file .env.example
cp .env.example .env

# Chạy server
npm run dev
```

### Chạy Frontend (Web Admin)

```bash
# Di chuyển vào thư mục web
cd WDP301_FE

# Cài đặt các dependencies
npm install

# Chạy ứng dụng web
npm run dev
```

### Chạy Mobile App

```bash
# Di chuyển vào thư mục mobile
cd WDP301_Mobile

# Cài đặt các dependencies
npm install

# Chạy trên Android
npx react-native run-android

# Chạy trên iOS
npx react-native run-ios
```

## 📸 Giao diện & Demo

_(Chúng tôi sẽ cập nhật hình ảnh và video demo của dự án sớm nhất có thể)_

## 👥 Thành viên nhóm - TamTech

| STT | Họ và Tên              | MSSV       | GitHub                                                                      | Vai trò               |
| :-: | :--------------------- | :--------- | :-------------------------------------------------------------------------- | :-------------------- |
|  1  | Lê Minh Duy            | `SE170571` | [minhduy-le](https://www.google.com/search?q=https://github.com/minhduy-le) | `Mobile Development`  |
|  2  | `Nguyễn Ngọc Bảo Trân` | `SE171264` | `[Link GitHub]`                                                             | `Front End Developer` |
|  3  | `Tô Triều Vỹ`          | `Se18`     | `[Link GitHub]`                                                             | `Back End Developer`  |
|  4  | Phạm Chu Chí Khang     | `SE183245` | [KhangPCC](https://github.com/Darkvolcano)                                  | `Front End Developer` |

## 👨‍🏫 Giảng viên hướng dẫn

- `Phạm Thanh Trí`

## 🙏 Lời cảm ơn

Nhóm **TamTech** xin chân thành cảm ơn giảng viên bộ môn WDP301 đã tận tình hướng dẫn chúng tôi trong suốt quá trình thực hiện dự án này.
