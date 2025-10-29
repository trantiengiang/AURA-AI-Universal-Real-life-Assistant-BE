# 🚀 Hướng dẫn Deploy AURA Backend lên Render.com

## ✅ Đã chuẩn bị sẵn

- ✅ `server.js` - đã cấu hình PORT = process.env.PORT || 8080
- ✅ `package.json` - đã có script "start": "node server.js"
- ✅ CORS - đã cấu hình cho production
- ✅ `render.yaml` - file cấu hình deploy 1-click
- ✅ Security middleware (helmet, rate limiting)

## 🎯 Bước 1: Tạo tài khoản Render.com

1. Truy cập [render.com](https://render.com)
2. Đăng ký/đăng nhập bằng GitHub
3. Kết nối GitHub repository

## 🎯 Bước 2: Deploy Backend

### Cách 1: Deploy từ render.yaml (Khuyến nghị)

1. **Push code lên GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Tạo Web Service trên Render:**
   - Vào Dashboard → "New" → "Web Service"
   - Chọn repository: `AURA-AI-Universal-Real-life-Assistant-BE`
   - Render sẽ tự động detect `render.yaml`
   - Click "Create Web Service"

### Cách 2: Deploy thủ công

1. **Tạo Web Service:**
   - Name: `aura-ai-backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Plan: `Free`

2. **Cấu hình Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your-super-secret-jwt-key-here
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,audio/wav
   FRONTEND_URL=https://your-frontend-domain.com
   ```

## 🎯 Bước 3: Cấu hình Database (Tùy chọn)

### Option 1: Sử dụng Database có sẵn
- Nếu bạn đã có database, thêm `DATABASE_URL` vào Environment Variables

### Option 2: Tạo Database mới trên Render
1. Tạo PostgreSQL Database trên Render
2. Copy connection string
3. Thêm vào Environment Variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

## 🎯 Bước 4: Deploy và Test

1. **Deploy:**
   - Click "Create Web Service"
   - Chờ build và deploy (5-10 phút)

2. **Test API:**
   - Health check: `https://aura-ai-backend.onrender.com/health`
   - API docs: `https://aura-ai-backend.onrender.com/api-docs`
   - Test endpoint: `https://aura-ai-backend.onrender.com/test`

## 🎯 Bước 5: Cấu hình Frontend

Cập nhật Frontend để gọi API:

```javascript
// Thay đổi base URL trong frontend
const API_BASE_URL = 'https://aura-ai-backend.onrender.com/api/v1';

// Ví dụ gọi API
fetch(`${API_BASE_URL}/health`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Build failed:**
   - Kiểm tra `package.json` có đúng dependencies
   - Xem logs trong Render Dashboard

2. **CORS error:**
   - Kiểm tra `FRONTEND_URL` trong Environment Variables
   - Đảm bảo frontend domain đúng

3. **Database connection:**
   - Kiểm tra `DATABASE_URL` format
   - Đảm bảo database accessible từ Render

4. **Port binding:**
   - Đảm bảo sử dụng `process.env.PORT` trong code
   - Render tự động set PORT

## 📊 Monitoring

- **Logs:** Render Dashboard → Service → Logs
- **Metrics:** CPU, Memory usage
- **Health:** `/health` endpoint

## 🚀 Production Tips

1. **Environment Variables:**
   - Sử dụng strong JWT_SECRET
   - Cấu hình đúng FRONTEND_URL

2. **Security:**
   - Rate limiting đã được cấu hình
   - Helmet security headers
   - CORS properly configured

3. **Performance:**
   - Free plan có giới hạn
   - Consider upgrade nếu cần

## 📝 URLs sau khi deploy

- **API Base:** `https://aura-ai-backend.onrender.com`
- **Health Check:** `https://aura-ai-backend.onrender.com/health`
- **API Docs:** `https://aura-ai-backend.onrender.com/api-docs`
- **Test:** `https://aura-ai-backend.onrender.com/test`

## 🎉 Kết quả

Sau khi deploy thành công, bạn sẽ có:
- ✅ Backend API chạy trên HTTPS
- ✅ URL public để frontend gọi API
- ✅ Swagger documentation
- ✅ Health check endpoint
- ✅ CORS configured cho production
