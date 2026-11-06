const express = require('express');
const path = require('path');
require('dotenv').config();

const database = require('./config/database');
const adminRoutes = require('./routes/admin/index.route');
const clientRoutes = require('./routes/client/index.route');
const variableConfig = require('./config/variable');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');

const app = express();
const port = 3000;

//Kết nối database
database.connect();

// Thiết lập thư mục views và view engine pug
app.set('views', path.join(__dirname, 'views')); // Thư mục chứa files Pug
app.set('view engine', 'pug'); // Thiết lập Pug làm view engine

//Thiết lập thư mục chứa các file tĩnh như CSS, JS, hình ảnh
app.use(express.static(path.join(__dirname, 'public'))); 

//Tạo biến toàn cục trong file PUG
app.locals.pathAdmin = variableConfig.pathAdmin;

//Tạo biến toàn cục trong file JS Backend
global.pathAdmin = variableConfig.pathAdmin;

//Sử dụng cookie parser
app.use(cookieParser('keyboard cat'));

//Cho phép gửi data lên dạng json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Hiển thị thông báo sau khi load lại trang
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard-cat-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60000,
    httpOnly: true
  }
}));

app.use(flash());

//Thiết lập đường dẫn
app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
app.use('/', clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});