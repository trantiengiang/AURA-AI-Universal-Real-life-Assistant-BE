# Hướng dẫn Setup Database

## Tùy chọn 1: SQL Server

### 1. Cài đặt SQL Server
- Tải và cài đặt SQL Server Express (miễn phí)
- Hoặc sử dụng SQL Server trên Docker:
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Cấu hình DATABASE_URL
Tạo file `.env` với nội dung:
```env
# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;user=sa;password=YourPassword123!;encrypt=true;trustServerCertificate=true"

# Hoặc nếu không có encryption:
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;user=sa;password=YourPassword123!;encrypt=false"
```

### 3. Chạy migration
```bash
npm install
npx prisma generate
npx prisma db push
```

---

## Tùy chọn 2: MySQL

### 1. Cài đặt MySQL
- Tải và cài đặt MySQL Community Server
- Hoặc sử dụng MySQL trên Docker:
```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=YourPassword123! -e MYSQL_DATABASE=aura_db -p 3306:3306 -d mysql:8.0
```

### 2. Cấu hình Prisma cho MySQL
Cập nhật `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. Cấu hình DATABASE_URL
```env
# MySQL
DATABASE_URL="mysql://root:YourPassword123!@localhost:3306/aura_db"
```

### 4. Cập nhật package.json
```json
{
  "dependencies": {
    "mysql2": "^3.6.5"
  }
}
```

### 5. Chạy migration
```bash
npm install
npx prisma generate
npx prisma db push
```

---

## Lưu ý quan trọng

1. **Backup dữ liệu**: Nếu có dữ liệu quan trọng, hãy backup trước khi chuyển đổi
2. **Kiểm tra compatibility**: Một số tính năng có thể khác nhau giữa các database
3. **Performance**: SQL Server thường có performance tốt hơn cho ứng dụng enterprise
4. **Cost**: MySQL miễn phí, SQL Server có phiên bản Express miễn phí

## Troubleshooting

### SQL Server
- Đảm bảo SQL Server Browser service đang chạy
- Kiểm tra firewall cho port 1433
- Sử dụng SQL Server Management Studio để test connection

### MySQL
- Đảm bảo MySQL service đang chạy
- Kiểm tra firewall cho port 3306
- Sử dụng MySQL Workbench để test connection

