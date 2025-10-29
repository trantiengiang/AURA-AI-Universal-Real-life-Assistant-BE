# 🎯 AURA Backend API - Tùy Chỉnh cURL Command

## ✅ **Đã sửa! Chỉ hiển thị 1 cURL command như trong ảnh**

### 🎯 **Vấn đề:**
- ❌ **Trước**: Hiển thị 3 options cURL (bash, PowerShell, CMD)
- ✅ **Sau**: Chỉ hiển thị 1 cURL command đơn giản

### 🔧 **Cách sửa:**

#### 1️⃣ **Cập nhật requestSnippets trong swagger.js:**
```javascript
requestSnippets: {
  generators: {
    'curl_bash': {
      title: 'cURL',
      syntax: 'bash'
    }
  }
}
```

#### 2️⃣ **Kết quả:**
- ✅ **Chỉ 1 cURL**: Không còn 3 options
- ✅ **Đơn giản**: Giống hệt trong ảnh
- ✅ **Dễ sử dụng**: Copy paste trực tiếp

### 🎨 **Giao diện giống ảnh:**
- **Parameters**: Input fields cho page, pageSize, isAdmin
- **Execute/Clear buttons**: Màu xanh và trắng
- **Response sections**:
  - **cURL**: Chỉ 1 command duy nhất
  - **Request URL**: Full URL với parameters
  - **Server response**: Code 200, Response body, Headers

### 🌐 **Truy cập:**
```
http://localhost:5000/api-docs
```

### 📋 **Tính năng:**
- ✅ **1 cURL command**: Không còn 3 options
- ✅ **Interactive testing**: Try it out
- ✅ **Parameters**: Input fields
- ✅ **Response**: JSON, headers, status code
- ✅ **Download**: Response body

### 🚀 **Server Status:**
- ✅ **Health**: http://localhost:5000/health
- ✅ **Swagger**: http://localhost:5000/api-docs
- ✅ **OpenAPI Spec**: http://localhost:5000/api-docs/swagger.json
- ✅ **cURL Fixed**: Chỉ hiển thị 1 command

---

**🎉 Swagger UI giống hệt ảnh! Mở http://localhost:5000/api-docs để xem!** 🎉
