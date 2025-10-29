# 🚀 AURA Backend API - Swagger Documentation

## 📚 Swagger UI Professional Setup

AURA Backend API đã được cấu hình với Swagger UI chuyên nghiệp theo chuẩn OpenAPI 3.1.0.

### 🎯 Features

- **Professional UI**: Giao diện đẹp như Swagger chính thức
- **OAS 3.1.0**: Tuân thủ chuẩn OpenAPI 3.1.0
- **Interactive Testing**: Test API trực tiếp trên giao diện
- **Auto-generated**: Tự động sinh docs từ JSDoc comments
- **Development Mode**: Bypass authentication cho development

### 🌐 Access URLs

- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health
- **Test Endpoint**: http://localhost:5000/test

### 📋 API Categories

1. **Authentication** - User management & auth
2. **Health Management** - Health tracking & analysis
3. **Finance Management** - Personal finance tracking
4. **AI Services** - AI-powered analysis
5. **File Upload** - Secure file handling
6. **Translation** - Multi-language translation
7. **Notes Management** - Digital notes & voice notes

### 🔧 Technical Stack

- **Backend**: Node.js + Express.js
- **Database**: SQL Server with Prisma ORM
- **Documentation**: Swagger UI + swagger-jsdoc
- **Authentication**: JWT (bypassed in dev mode)

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access Swagger UI
# Open browser: http://localhost:5000/api-docs
```

### 📝 Adding API Documentation

Để thêm documentation cho API mới, sử dụng JSDoc comments:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Your API description
 *     tags: [Your Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *                 example: "value"
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
```

### 🎨 Customization

Swagger UI được tùy chỉnh với:
- Professional color scheme
- AURA branding
- Responsive design
- Interactive features
- Development-friendly settings

### 🔐 Development Mode

Trong development mode:
- Authentication được bypass
- Sử dụng dummy user ID
- Tất cả endpoints đều accessible
- Logs chi tiết cho debugging

### 📊 Monitoring

- **Health Check**: `/health` - Server & database status
- **Test Endpoint**: `/test` - Quick API test
- **Logs**: Winston logging system
- **Database**: SQL Server connection monitoring

---

**AURA - AI Universal Real-life Assistant**  
*Professional API Documentation System*
