# Tour Management

Ứng dụng web quản lý và đặt tour du lịch. Giao diện được render bằng Pug; người dùng có thể tìm kiếm tour, xem thông tin tour, tạo đơn hàng và thanh toán. Khu vực quản trị hỗ trợ quản lý tour, danh mục, đơn hàng, khách hàng, tài khoản và thông tin website.

## Công nghệ

- Node.js, Express
- MongoDB với Mongoose
- Pug
- Các tích hợp tùy chọn: Cloudinary, Nodemailer, ZaloPay, VNPay và Google Gemini

## Yêu cầu

- Node.js 18 trở lên và npm
- MongoDB (MongoDB Atlas hoặc MongoDB cài đặt riêng)
- Tài khoản và thông tin cấu hình của các dịch vụ ngoài nếu muốn sử dụng chức năng tương ứng

## Cài đặt và chạy

1. Cài các dependency:

   ```bash
   npm install
   ```

2. Tạo tệp `.env` từ mẫu `env.example.txt`. Trên Windows PowerShell:

   ```powershell
   Copy-Item env.example.txt .env
   ```

3. Mở `.env`, điền thông tin MongoDB và các dịch vụ cần sử dụng. Không dùng nguyên các giá trị mẫu; giữ `.env` riêng tư và không commit tệp này.

4. Khởi chạy ứng dụng:

   ```bash
   npm start
   ```

   Ứng dụng chạy tại [http://localhost:3000](http://localhost:3000). Script `start` sử dụng Nodemon và bật Node.js inspector.

## Cấu hình môi trường

Các tên biến dưới đây được khai báo trong `env.example.txt`. Chỉ cần cấu hình những dịch vụ bạn định sử dụng; MongoDB cần được cấu hình để ứng dụng truy cập dữ liệu.

| Biến | Mục đích |
| --- | --- |
| `DATABASE` | MongoDB connection string |
| `JWT_SECRET` | Khóa ký và xác thực JWT |
| `SESSION_SECRET` | Khóa phiên Express; nếu không khai báo, ứng dụng dùng giá trị dự phòng trong mã nguồn. Nên đặt khóa riêng khi chạy ứng dụng. |
| `EMAIL_USER`, `EMAIL_PASS` | Tài khoản gửi email, dùng cho chức năng gửi thư |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Thông tin Cloudinary để lưu trữ ảnh |
| `ZALOPAY_APP_ID`, `ZALOPAY_KEY_1`, `ZALOPAY_KEY_2`, `ZALOPAY_DOMAIN` | Cấu hình thanh toán ZaloPay |
| `VNPAY_TMN_CODE`, `VNPAY_SECRET_KEY`, `VNPAY_API_URL` | Cấu hình thanh toán VNPay |
| `DOMAIN_WEBSITE` | Địa chỉ website dùng làm URL quay về và callback thanh toán |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | API key và model Gemini cho tìm kiếm tour bằng câu yêu cầu tự nhiên; model mặc định trong mã nguồn là `gemini-3.6-flash` |

Để kiểm thử callback thanh toán, `DOMAIN_WEBSITE` cần là địa chỉ mà cổng thanh toán có thể truy cập. Chọn endpoint sandbox hoặc production phù hợp với tài khoản của bạn.

## Chức năng chính

### Dành cho khách hàng

- Xem trang chủ, danh sách tour, chi tiết tour và tour theo danh mục.
- Tìm kiếm tour và gửi yêu cầu tìm kiếm bằng AI.
- Đăng ký, đăng nhập và đăng xuất tài khoản khách hàng.
- Quản lý giỏ hàng, tạo đơn hàng và theo dõi kết quả thanh toán.
- Gửi thông tin liên hệ.

### Dành cho quản trị viên

- Đăng nhập và quản lý hồ sơ quản trị.
- Xem dashboard; quản lý tour, danh mục, đơn hàng, khách hàng và liên hệ.
- Quản lý tài khoản quản trị, vai trò và cài đặt website.

Khu vực quản trị được mount dưới đường dẫn `/admin`; trang đăng nhập quản trị ở `/admin/account/login`. Các trang quản trị ngoài luồng tài khoản yêu cầu xác thực.

## Cấu trúc thư mục

```text
config/        Cấu hình database, quyền và ứng dụng
controllers/   Xử lý nghiệp vụ cho client và admin
helpers/       Các tiện ích dùng chung và tích hợp dịch vụ
middlewares/   Middleware xác thực và dữ liệu dùng chung
models/        Mongoose models
public/        CSS, JavaScript và hình ảnh tĩnh
routes/        Routes cho client và admin
validates/     Kiểm tra dữ liệu đầu vào
views/         Giao diện Pug
index.js       Điểm khởi chạy ứng dụng
```

## Ghi chú phát triển

- Máy chủ hiện dùng cổng `3000`, được đặt trực tiếp trong `index.js`.
- Ứng dụng dùng MongoDB qua biến `DATABASE`.
- `npm start` chạy ứng dụng ở chế độ theo dõi thay đổi bằng Nodemon.
- `package.json` hiện chưa khai báo script kiểm thử.
