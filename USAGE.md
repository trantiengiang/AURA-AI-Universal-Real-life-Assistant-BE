# 🚀 Hướng dẫn sử dụng AURA API Tester

## Cách chạy và test API

### 1. Cài đặt và khởi động

```bash
# Cài đặt dependencies
npm install

# Setup môi trường (tạo .env file)
npm run setup

# Cấu hình database
npm run db:generate
npm run db:push

# Khởi động server
npm run dev
```

### 2. Truy cập Web Tester

Mở trình duyệt và truy cập: **http://localhost:5000**

Bạn sẽ thấy giao diện web đẹp để test tất cả các API endpoints!

### 3. Các tính năng của Web Tester

#### 🔐 Authentication
- **Register**: Tạo tài khoản mới
- **Login**: Đăng nhập với email/password
- **Token Management**: Tự động lưu và sử dụng JWT token

#### 🩺 Health API
- **Analyze Health**: Phân tích dữ liệu sức khỏe (cân nặng, chiều cao, calories, giấc ngủ)
- **Health Stats**: Xem thống kê sức khỏe

#### 💸 Finance API
- **Create Record**: Tạo ghi chú thu chi
- **Finance Stats**: Xem thống kê tài chính

#### 📝 Notes API
- **Create Note**: Tạo ghi chú text
- **Get Notes**: Lấy danh sách ghi chú
- **Tags Support**: Hỗ trợ tags cho ghi chú

#### 🌍 Translation API
- **Translate Text**: Dịch văn bản đa ngôn ngữ
- **Language Detection**: Tự động phát hiện ngôn ngữ

#### 💬 Chat API
- **Ask Question**: Hỏi AI (GPT-4, Groq, Gemini)
- **Model Selection**: Chọn AI model

#### 🎨 Image API
- **Generate Image**: Tạo ảnh AI với Stability AI
- **Style Selection**: Chọn style ảnh

#### 🧠 Orchestrator API
- **Complex Requests**: Xử lý yêu cầu phức tạp
- **Multi-AI Coordination**: Điều phối nhiều AI

#### 📊 System Status
- **Health Check**: Kiểm tra trạng thái server

### 4. Cách sử dụng

1. **Đăng ký/Đăng nhập** trước để test các API cần authentication
2. **Điền thông tin** vào các form tương ứng
3. **Click "Test"** để gọi API
4. **Xem kết quả** trong phần Response

### 5. API Endpoints có sẵn

#### Public APIs (không cần đăng nhập):
- `GET /health` - Health check
- `POST /api/chat/ask` - Chat với AI
- `POST /api/image/generate` - Tạo ảnh AI
- `POST /api/orchestrator/process` - Xử lý yêu cầu phức tạp

#### Protected APIs (cần đăng nhập):
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user
- `POST /api/health/analyze` - Phân tích sức khỏe
- `GET /api/health/stats` - Thống kê sức khỏe
- `POST /api/finance/record` - Tạo ghi chú tài chính
- `GET /api/finance/stats` - Thống kê tài chính
- `POST /api/notes/create` - Tạo ghi chú
- `GET /api/notes` - Lấy ghi chú
- `POST /api/translate/text` - Dịch văn bản

### 6. Cấu hình API Keys

Để sử dụng đầy đủ tính năng, cần cấu hình các API keys trong file `.env`:

```env
# AI API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
STABILITY_API_KEY=your_stability_api_key_here
TRANSLATE_API_KEY=your_google_translate_api_key_here
```

### 7. Database

Sử dụng PostgreSQL với Prisma ORM. Có thể dùng:
- PostgreSQL local
- Supabase (cloud)
- Docker PostgreSQL

### 8. Troubleshooting

#### Lỗi kết nối database:
```bash
# Kiểm tra database URL trong .env
# Chạy lại migration
npm run db:push
```

#### Lỗi API keys:
- Kiểm tra file `.env` có đúng format không
- Đảm bảo API keys hợp lệ và có credit

#### Lỗi CORS:
- Server đã cấu hình CORS cho localhost:3000
- Nếu dùng port khác, cập nhật trong server.js

### 9. Development

```bash
# Chạy với auto-reload
npm run dev

# Chạy tests
npm test

# Xem database
npm run db:studio
```

### 10. Production

```bash
# Build và start
npm start
```

## 🎉 Chúc bạn test API thành công!

Web tester này giúp bạn dễ dàng test tất cả các tính năng của AURA Backend API mà không cần Postman hay công cụ khác!




