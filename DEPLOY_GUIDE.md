# 🚀 AURA Backend - Hướng Dẫn Deploy Miễn Phí

## 🎯 **Mục tiêu: Deploy lên web miễn phí như http://103.2.225.22:8081/swagger-ui/index.html#**

### 📋 **Các Platform Deploy Miễn Phí:**

#### 1️⃣ **Railway** (Khuyến nghị nhất)
- **Ưu điểm**: Dễ deploy, hỗ trợ Node.js + SQL Server
- **Miễn phí**: $5 credit/tháng (đủ dùng)
- **Link**: https://railway.app
- **Cách deploy**:
  1. Đăng ký tài khoản Railway
  2. Connect GitHub repository
  3. Chọn "Deploy from GitHub"
  4. Railway sẽ auto detect Node.js và deploy
  5. Thêm environment variables trong Railway dashboard

#### 2️⃣ **Render**
- **Ưu điểm**: Free tier 750h/tháng, auto SSL
- **Miễn phí**: Có giới hạn nhưng đủ dùng
- **Link**: https://render.com
- **Cách deploy**:
  1. Đăng ký tài khoản Render
  2. Connect GitHub repository
  3. Chọn "New Web Service"
  4. Chọn repository và branch
  5. Render sẽ auto detect và deploy

#### 3️⃣ **Vercel**
- **Ưu điểm**: Tốc độ nhanh, dễ dùng
- **Miễn phí**: Unlimited cho personal
- **Link**: https://vercel.com
- **Cách deploy**:
  1. Đăng ký tài khoản Vercel
  2. Connect GitHub repository
  3. Import project
  4. Vercel sẽ auto deploy

#### 4️⃣ **Heroku** (Có giới hạn)
- **Ưu điểm**: Nổi tiếng, dễ dùng
- **Miễn phí**: 550-1000 dyno hours/tháng
- **Link**: https://heroku.com

### 🔧 **Files đã chuẩn bị:**

#### 1️⃣ **railway.json** - Cấu hình Railway
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2️⃣ **vercel.json** - Cấu hình Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3️⃣ **render.yaml** - Cấu hình Render
```yaml
services:
  - type: web
    name: aura-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 🌐 **Environment Variables cần thiết:**

```bash
# Database
DATABASE_URL="sqlserver://username:password@server:1433;database=aura_db;encrypt=true;trustServerCertificate=true"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# API Keys
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"

# Server
NODE_ENV="production"
PORT="5000"
```

### 📝 **Các bước deploy:**

#### **Bước 1: Push code lên GitHub**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### **Bước 2: Chọn platform và deploy**
- **Railway**: Connect GitHub → Deploy
- **Render**: New Web Service → Connect GitHub
- **Vercel**: Import Project → Connect GitHub

#### **Bước 3: Cấu hình Environment Variables**
- Thêm tất cả biến môi trường trong dashboard
- Đặc biệt quan trọng: `DATABASE_URL`

#### **Bước 4: Deploy và test**
- Platform sẽ tự động build và deploy
- Truy cập URL được cung cấp
- Test Swagger UI tại `{URL}/api-docs`

### 🎯 **Kết quả mong đợi:**
- Swagger UI giống như http://103.2.225.22:8081/swagger-ui/index.html#
- API hoạt động 24/7
- SSL certificate tự động
- Custom domain (tùy chọn)

### 💡 **Lưu ý quan trọng:**
- **Database**: Cần SQL Server cloud (Azure, AWS RDS, hoặc Railway PostgreSQL)
- **API Keys**: Cần cấu hình đúng các API keys
- **Environment**: Set `NODE_ENV=production`
- **Port**: Platform sẽ tự động set PORT

---

**🎉 Chọn Railway để deploy dễ nhất và có Swagger UI đẹp như mong muốn!** 🎉
