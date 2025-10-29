// Temporary bypass authentication for development
const bypassAuth = (req, res, next) => {
  // Chỉ bypass trong development mode
  if (process.env.NODE_ENV === 'development') {
    // Tạo một fake user ID cho testing
    req.user = {
      id: 'dev-user-001',
      email: 'dev@aura.com',
      name: 'Development User'
    };
    return next();
  }
  
  // Trong production, vẫn yêu cầu authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token required'
    });
  }

  // Verify JWT token (giữ nguyên logic cũ)
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'aura-super-secret-jwt-key-2024-change-in-production';
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

module.exports = bypassAuth;
