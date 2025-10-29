# 🗄️ AURA Database Schema - SQL Server

## 📋 Tổng quan các bảng cần tạo

Dựa trên phân tích code, ứng dụng AURA cần **5 bảng chính**:

### 1. **users** - Bảng người dùng
```sql
- id (NVARCHAR(25), Primary Key)
- name (NVARCHAR(255), NOT NULL)
- email (NVARCHAR(255), NOT NULL, UNIQUE)
- password (NVARCHAR(255), NOT NULL) - Mã hóa bcrypt
- age (INT, NULL)
- gender (NVARCHAR(50), NULL)
- avatar (NVARCHAR(500), NULL)
- created_at (DATETIME2, DEFAULT GETDATE())
- updated_at (DATETIME2, DEFAULT GETDATE())
```

### 2. **health_records** - Hồ sơ sức khỏe
```sql
- id (NVARCHAR(25), Primary Key)
- user_id (NVARCHAR(25), Foreign Key → users.id)
- date (DATETIME2, NOT NULL)
- weight (FLOAT, NULL)
- height (FLOAT, NULL)
- calories (INT, NULL)
- sleep (INT, NULL)
- exercise (NVARCHAR(500), NULL)
- advice (NVARCHAR(MAX), NULL)
- image_url (NVARCHAR(500), NULL)
- created_at (DATETIME2, DEFAULT GETDATE())
```

### 3. **finance_records** - Hồ sơ tài chính
```sql
- id (NVARCHAR(25), Primary Key)
- user_id (NVARCHAR(25), Foreign Key → users.id)
- category (NVARCHAR(100), NOT NULL)
- amount (FLOAT, NOT NULL)
- note (NVARCHAR(500), NULL)
- date (DATETIME2, NOT NULL)
- type (NVARCHAR(20), NOT NULL, CHECK IN ('income', 'expense'))
- created_at (DATETIME2, DEFAULT GETDATE())
```

### 4. **notes** - Ghi chú
```sql
- id (NVARCHAR(25), Primary Key)
- user_id (NVARCHAR(25), Foreign Key → users.id)
- title (NVARCHAR(255), NOT NULL)
- content (NVARCHAR(MAX), NOT NULL)
- tags (NVARCHAR(MAX), NULL) - JSON array
- is_voice (BIT, DEFAULT 0)
- audio_url (NVARCHAR(500), NULL)
- created_at (DATETIME2, DEFAULT GETDATE())
- updated_at (DATETIME2, DEFAULT GETDATE())
```

### 5. **translations** - Bản dịch
```sql
- id (NVARCHAR(25), Primary Key)
- user_id (NVARCHAR(25), Foreign Key → users.id)
- input_text (NVARCHAR(MAX), NOT NULL)
- output_text (NVARCHAR(MAX), NOT NULL)
- from_lang (NVARCHAR(10), NOT NULL)
- to_lang (NVARCHAR(10), NOT NULL)
- is_voice (BIT, DEFAULT 0)
- audio_url (NVARCHAR(500), NULL)
- created_at (DATETIME2, DEFAULT GETDATE())
```

## 🚀 Cách tạo database

### Cách 1: Tự động với PowerShell Script (Khuyến nghị)

```powershell
# Chạy script PowerShell
.\setup-database.ps1

# Hoặc với các tùy chọn
.\setup-database.ps1 -ServerName "localhost" -DatabaseName "aura_db" -CreateDatabase
```

### Cách 2: Thủ công với SQL Server Management Studio

1. **Mở SQL Server Management Studio**
2. **Kết nối đến SQL Server**
3. **Tạo database mới:**
   ```sql
   CREATE DATABASE aura_db;
   GO
   USE aura_db;
   GO
   ```
4. **Chạy file `database-schema.sql`**

### Cách 3: Sử dụng Prisma (Tự động)

```bash
# Cài đặt dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

## 🔧 Cấu hình DATABASE_URL

### Windows Authentication (Khuyến nghị)
```env
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
```

### SQL Server Authentication
```env
DATABASE_URL="sqlserver://localhost:1433;database=aura_db;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"
```

### SQL Server Express LocalDB
```env
DATABASE_URL="sqlserver://(localdb)\\MSSQLLocalDB;database=aura_db;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
```

## 📊 Các tính năng bổ sung

### Indexes (Chỉ mục)
- **Performance indexes** cho tất cả foreign keys
- **Composite indexes** cho queries phức tạp
- **Date indexes** cho filtering theo thời gian

### Triggers (Trigger)
- **Auto-update triggers** cho `updated_at` fields
- **Cascade delete** khi xóa user

### Stored Procedures (Thủ tục lưu trữ)
- `sp_GetUserStats` - Lấy thống kê user
- `sp_CleanupOldData` - Dọn dẹp dữ liệu cũ

### Views (View)
- `vw_UserSummary` - Tổng hợp thông tin user

## 🔍 Kiểm tra sau khi tạo

### 1. Kiểm tra tables
```sql
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

### 2. Kiểm tra foreign keys
```sql
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    cp.name AS ParentColumn,
    tr.name AS ReferencedTable,
    cr.name AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
INNER JOIN sys.columns cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
ORDER BY tp.name, fk.name;
```

### 3. Kiểm tra indexes
```sql
SELECT 
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    c.name AS ColumnName
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.name IS NOT NULL
ORDER BY t.name, i.name;
```

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **"Cannot connect to SQL Server"**
   - Kiểm tra SQL Server service đang chạy
   - Kiểm tra SQL Server Browser service
   - Kiểm tra firewall port 1433

2. **"Login failed"**
   - Kiểm tra authentication mode
   - Kiểm tra user permissions
   - Kiểm tra DATABASE_URL format

3. **"Database does not exist"**
   - Tạo database trước
   - Hoặc dùng `-CreateDatabase` flag

4. **"Foreign key constraint"**
   - Kiểm tra thứ tự tạo tables
   - Kiểm tra data integrity

## 📝 Sample Data

Script sẽ tự động tạo sample data:
- **2 users** mẫu
- **2 health records** mẫu  
- **3 finance records** mẫu
- **2 notes** mẫu
- **2 translations** mẫu

## 🎯 Next Steps

Sau khi tạo database thành công:

1. **Cập nhật .env file** với DATABASE_URL đúng
2. **Chạy:** `npm run setup:db`
3. **Test:** `npm start`
4. **Kiểm tra:** `GET /health`

---

**Chúc bạn setup database thành công! 🎉**

