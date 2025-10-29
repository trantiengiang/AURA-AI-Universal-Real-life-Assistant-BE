const fs = require('fs');
const path = require('path');

// Script để chuyển đổi database provider
function switchDatabaseProvider(provider) {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  const packagePath = path.join(__dirname, 'package.json');
  
  // Đọc schema hiện tại
  let schema = fs.readFileSync(schemaPath, 'utf8');
  let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Cập nhật provider trong schema
  schema = schema.replace(
    /provider\s*=\s*"(postgresql|sqlserver|mysql)"/,
    `provider = "${provider}"`
  );
  
  // Cập nhật dependencies trong package.json
  const drivers = {
    'postgresql': 'pg',
    'sqlserver': 'mssql', 
    'mysql': 'mysql2'
  };
  
  // Xóa driver cũ
  Object.values(drivers).forEach(driver => {
    if (packageJson.dependencies[driver]) {
      delete packageJson.dependencies[driver];
    }
  });
  
  // Thêm driver mới
  if (provider === 'mysql') {
    packageJson.dependencies['mysql2'] = '^3.6.5';
  } else if (provider === 'sqlserver') {
    packageJson.dependencies['mssql'] = '^10.0.1';
  } else if (provider === 'postgresql') {
    packageJson.dependencies['pg'] = '^8.11.3';
  }
  
  // Ghi file
  fs.writeFileSync(schemaPath, schema);
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  
  console.log(`✅ Đã chuyển đổi sang ${provider.toUpperCase()}`);
  console.log('📦 Hãy chạy: npm install && npx prisma generate');
}

// Lấy provider từ command line argument
const provider = process.argv[2];

if (!provider || !['postgresql', 'sqlserver', 'mysql'].includes(provider)) {
  console.log('❌ Vui lòng chọn provider: postgresql, sqlserver, hoặc mysql');
  console.log('📝 Cách sử dụng: node switch-db.js <provider>');
  console.log('📝 Ví dụ: node switch-db.js mysql');
  process.exit(1);
}

switchDatabaseProvider(provider);

