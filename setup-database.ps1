# =============================================
# AURA Database Setup Script for SQL Server
# =============================================
# Script PowerShell để tự động tạo database và tables

param(
    [string]$ServerName = "localhost",
    [string]$DatabaseName = "aura_db",
    [string]$UseWindowsAuth = $true,
    [string]$Username = "",
    [string]$Password = "",
    [switch]$CreateDatabase = $false,
    [switch]$SkipSampleData = $false
)

# Function để hiển thị thông báo
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function để kiểm tra kết nối SQL Server
function Test-SqlServerConnection {
    param($ServerName, $DatabaseName, $UseWindowsAuth, $Username, $Password)
    
    try {
        if ($UseWindowsAuth) {
            $connectionString = "Server=$ServerName;Database=$DatabaseName;Integrated Security=true;TrustServerCertificate=true;"
        } else {
            $connectionString = "Server=$ServerName;Database=$DatabaseName;User Id=$Username;Password=$Password;TrustServerCertificate=true;"
        }
        
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        $connection.Close()
        return $true
    } catch {
        Write-ColorOutput Red "❌ Không thể kết nối SQL Server: $($_.Exception.Message)"
        return $false
    }
}

# Function để chạy SQL script
function Invoke-SqlScript {
    param($ServerName, $DatabaseName, $UseWindowsAuth, $Username, $Password, $ScriptPath)
    
    try {
        if ($UseWindowsAuth) {
            $connectionString = "Server=$ServerName;Database=$DatabaseName;Integrated Security=true;TrustServerCertificate=true;"
        } else {
            $connectionString = "Server=$ServerName;Database=$DatabaseName;User Id=$Username;Password=$Password;TrustServerCertificate=true;"
        }
        
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $scriptContent = Get-Content $ScriptPath -Raw
        $command = New-Object System.Data.SqlClient.SqlCommand($scriptContent, $connection)
        $command.CommandTimeout = 300 # 5 minutes timeout
        
        Write-ColorOutput Yellow "🔄 Đang chạy SQL script..."
        $command.ExecuteNonQuery()
        
        $connection.Close()
        return $true
    } catch {
        Write-ColorOutput Red "❌ Lỗi khi chạy SQL script: $($_.Exception.Message)"
        return $false
    }
}

# Main execution
Write-ColorOutput Cyan "🚀 AURA Database Setup Script"
Write-ColorOutput Cyan "================================="

# Kiểm tra SQL Server Management Studio có cài đặt không
Write-ColorOutput Yellow "🔍 Kiểm tra SQL Server..."

# Kiểm tra kết nối
if (-not (Test-SqlServerConnection -ServerName $ServerName -DatabaseName "master" -UseWindowsAuth $UseWindowsAuth -Username $Username -Password $Password)) {
    Write-ColorOutput Red "❌ Không thể kết nối SQL Server. Vui lòng kiểm tra:"
    Write-ColorOutput Red "   - SQL Server đang chạy"
    Write-ColorOutput Red "   - SQL Server Browser service đang chạy"
    Write-ColorOutput Red "   - Firewall cho phép port 1433"
    Write-ColorOutput Red "   - Authentication settings"
    exit 1
}

Write-ColorOutput Green "✅ Kết nối SQL Server thành công!"

# Tạo database nếu cần
if ($CreateDatabase) {
    Write-ColorOutput Yellow "🔄 Đang tạo database '$DatabaseName'..."
    
    try {
        if ($UseWindowsAuth) {
            $connectionString = "Server=$ServerName;Database=master;Integrated Security=true;TrustServerCertificate=true;"
        } else {
            $connectionString = "Server=$ServerName;Database=master;User Id=$Username;Password=$Password;TrustServerCertificate=true;"
        }
        
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $createDbScript = "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$DatabaseName') CREATE DATABASE [$DatabaseName];"
        $command = New-Object System.Data.SqlClient.SqlCommand($createDbScript, $connection)
        $command.ExecuteNonQuery()
        
        $connection.Close()
        Write-ColorOutput Green "✅ Database '$DatabaseName' đã được tạo!"
    } catch {
        Write-ColorOutput Red "❌ Lỗi khi tạo database: $($_.Exception.Message)"
        exit 1
    }
}

# Kiểm tra file SQL script
$scriptPath = Join-Path $PSScriptRoot "database-schema.sql"
if (-not (Test-Path $scriptPath)) {
    Write-ColorOutput Red "❌ Không tìm thấy file database-schema.sql"
    Write-ColorOutput Red "   Vui lòng đảm bảo file này tồn tại trong cùng thư mục với script này."
    exit 1
}

# Chạy SQL script
Write-ColorOutput Yellow "🔄 Đang tạo tables và schema..."

if ($SkipSampleData) {
    Write-ColorOutput Yellow "⚠️ Bỏ qua sample data theo yêu cầu"
    # Tạo temporary script không có sample data
    $scriptContent = Get-Content $scriptPath -Raw
    $scriptContent = $scriptContent -replace "-- Thêm user mẫu.*?GO\s*", ""
    $scriptContent = $scriptContent -replace "-- Thêm health record mẫu.*?GO\s*", ""
    $scriptContent = $scriptContent -replace "-- Thêm finance record mẫu.*?GO\s*", ""
    $scriptContent = $scriptContent -replace "-- Thêm note mẫu.*?GO\s*", ""
    $scriptContent = $scriptContent -replace "-- Thêm translation mẫu.*?GO\s*", ""
    
    $tempScriptPath = Join-Path $PSScriptRoot "database-schema-temp.sql"
    $scriptContent | Out-File -FilePath $tempScriptPath -Encoding UTF8
    
    if (Invoke-SqlScript -ServerName $ServerName -DatabaseName $DatabaseName -UseWindowsAuth $UseWindowsAuth -Username $Username -Password $Password -ScriptPath $tempScriptPath) {
        Remove-Item $tempScriptPath
        Write-ColorOutput Green "✅ Database schema đã được tạo thành công!"
    } else {
        Remove-Item $tempScriptPath -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    if (Invoke-SqlScript -ServerName $ServerName -DatabaseName $DatabaseName -UseWindowsAuth $UseWindowsAuth -Username $Username -Password $Password -ScriptPath $scriptPath) {
        Write-ColorOutput Green "✅ Database schema và sample data đã được tạo thành công!"
    } else {
        exit 1
    }
}

# Kiểm tra kết nối đến database mới
Write-ColorOutput Yellow "🔍 Kiểm tra kết nối database mới..."
if (Test-SqlServerConnection -ServerName $ServerName -DatabaseName $DatabaseName -UseWindowsAuth $UseWindowsAuth -Username $Username -Password $Password) {
    Write-ColorOutput Green "✅ Kết nối database '$DatabaseName' thành công!"
} else {
    Write-ColorOutput Red "❌ Không thể kết nối database '$DatabaseName'"
    exit 1
}

# Hiển thị thông tin hoàn thành
Write-ColorOutput Cyan ""
Write-ColorOutput Cyan "🎉 HOÀN THÀNH!"
Write-ColorOutput Cyan "================================="
Write-ColorOutput Green "✅ Database: $DatabaseName"
Write-ColorOutput Green "✅ Server: $ServerName"
Write-ColorOutput Green "✅ Tables: users, health_records, finance_records, notes, translations"
Write-ColorOutput Green "✅ Indexes, triggers, stored procedures, views đã được tạo"
if (-not $SkipSampleData) {
    Write-ColorOutput Green "✅ Sample data đã được thêm"
}
Write-ColorOutput Cyan ""
Write-ColorOutput Yellow "📝 Bước tiếp theo:"
Write-ColorOutput White "   1. Cập nhật DATABASE_URL trong file .env"
Write-ColorOutput White "   2. Chạy: npm run setup:db"
Write-ColorOutput White "   3. Chạy: npm start"
Write-ColorOutput Cyan ""
Write-ColorOutput Green "🔗 DATABASE_URL cho .env:"
if ($UseWindowsAuth) {
    Write-ColorOutput White "   DATABASE_URL=`"sqlserver://$ServerName:1433;database=$DatabaseName;integratedSecurity=true;encrypt=true;trustServerCertificate=true`""
} else {
    Write-ColorOutput White "   DATABASE_URL=`"sqlserver://$ServerName:1433;database=$DatabaseName;user=$Username;password=$Password;encrypt=true;trustServerCertificate=true`""
}
Write-ColorOutput Cyan "================================="

