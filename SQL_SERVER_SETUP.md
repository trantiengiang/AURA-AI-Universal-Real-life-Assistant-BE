# 🚀 AURA Backend - SQL Server Setup Guide

## 📋 Yêu cầu hệ thống

- **Node.js**: v16+ 
- **SQL Server**: 2019+ hoặc SQL Server Express
- **Windows**: Windows 10/11 (khuyến nghị)

## 🔧 Cài đặt SQL Server

### Tùy chọn 1: SQL Server Express (Miễn phí)
1. Tải SQL Server Express từ [Microsoft](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. Cài đặt với cấu hình mặc định
3. Đảm bảo SQL Server Browser service đang chạy

### Tùy chọn 2: Docker (Khuyến nghị cho development)
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

## ⚙️ Cấu hình Database

### 1. Tạo file `.env`
Tạo file `.env` trong thư mục gốc với nội dung:

```env
# AURA Backend Environment Configuration

# Database Configuration - SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;integratedSecurity=true;encrypt=true;trustServerCertificate=true"

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=aura-super-secret-jwt-key-2024-change-in-production
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
FRONTEND_URL=http://localhost:3000

# AI Services (thêm API keys của bạn vào đây)
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
GROQ_API_KEY=your-groq-api-key-here
STABILITY_API_KEY=your-stability-api-key-here

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,audio/wav

# Logging
LOG_LEVEL=info
LOG_FILE=logs/combined.log
ERROR_LOG_FILE=logs/error.log
```

### 2. Các tùy chọn DATABASE_URL khác

#### Windows Authentication (Khuyến nghị)
```env
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
```

#### SQL Server Authentication
```env
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;user=sa;password=YourPassword123!;encrypt=true;trustServerCertificate=true"
```

#### SQL Server Express LocalDB
```env
DATABASE_URL="sqlserver://(localdb)\\MSSQLLocalDB;database=aura_db;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
```

## 🚀 Chạy Setup

### Cách 1: Setup tự động (Khuyến nghị)
```bash
# Setup database hoàn chỉnh
npm run setup:db

# Setup với demo data
npm run setup:db:demo
```

### Cách 2: Setup thủ công
```bash
# 1. Cài đặt dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Push database schema
npm run db:push

# 4. Chạy demo data (tùy chọn)
npm run demo
```

## 🎯 Chạy ứng dụng

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔍 Kiểm tra kết nối

Truy cập: `http://localhost:5000/health`

Response mong đợi:
```json
{
  "status": "success",
  "message": "AURA Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "message": "Database is healthy"
  }
}
```

## 🛠️ Troubleshooting

### Lỗi kết nối database
1. **Kiểm tra SQL Server đang chạy**:
   - Mở SQL Server Configuration Manager
   - Đảm bảo SQL Server service đang chạy
   - Đảm bảo SQL Server Browser service đang chạy

2. **Kiểm tra firewall**:
   - Mở port 1433 trong Windows Firewall
   - Cho phép SQL Server qua firewall

3. **Kiểm tra authentication**:
   - Đảm bảo Windows Authentication được enable
   - Hoặc SQL Server Authentication được enable

### Lỗi Prisma
```bash
# Reset database schema
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

### Lỗi permissions
- Đảm bảo user có quyền tạo database
- Hoặc tạo database `aura_db` trước trong SQL Server Management Studio

## 📊 Database Schema

Sau khi setup thành công, bạn sẽ có các bảng:
- `users` - Thông tin người dùng
- `health_records` - Hồ sơ sức khỏe
- `finance_records` - Hồ sơ tài chính  
- `notes` - Ghi chú
- `translations` - Bản dịch

## 🔧 Quản lý Database

```bash
# Mở Prisma Studio (GUI để quản lý data)
npm run db:studio

# Reset toàn bộ database
npm run db:reset

# Push schema changes
npm run db:push
```

## 📝 Lưu ý quan trọng

1. **Backup dữ liệu**: Luôn backup trước khi reset database
2. **Environment**: Không commit file `.env` vào git
3. **Security**: Thay đổi JWT_SECRET trong production
4. **Performance**: SQL Server có performance tốt hơn PostgreSQL cho enterprise apps

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong thư mục `logs/`
2. Chạy health check: `GET /health`
3. Kiểm tra SQL Server logs
4. Đảm bảo tất cả services đang chạy

---

**Chúc bạn setup thành công! 🎉**

