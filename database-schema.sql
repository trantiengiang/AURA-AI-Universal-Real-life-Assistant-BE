-- =============================================
-- AURA Backend Database Schema for SQL Server
-- =============================================
-- Tạo database và các bảng cần thiết cho ứng dụng AURA

-- Tạo database (nếu chưa có)
-- CREATE DATABASE aura_db;
-- GO
-- USE aura_db;
-- GO

-- =============================================
-- 1. BẢNG USERS (Người dùng)
-- =============================================
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(25) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [password] NVARCHAR(255) NOT NULL,
    [age] INT NULL,
    [gender] NVARCHAR(50) NULL,
    [avatar] NVARCHAR(500) NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- 2. BẢNG HEALTH_RECORDS (Hồ sơ sức khỏe)
-- =============================================
CREATE TABLE [dbo].[health_records] (
    [id] NVARCHAR(25) NOT NULL PRIMARY KEY,
    [user_id] NVARCHAR(25) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [weight] FLOAT NULL,
    [height] FLOAT NULL,
    [calories] INT NULL,
    [sleep] INT NULL,
    [exercise] NVARCHAR(500) NULL,
    [advice] NVARCHAR(MAX) NULL,
    [image_url] NVARCHAR(500) NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT [FK_health_records_user_id] 
        FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) 
        ON DELETE CASCADE
);
GO

-- =============================================
-- 3. BẢNG FINANCE_RECORDS (Hồ sơ tài chính)
-- =============================================
CREATE TABLE [dbo].[finance_records] (
    [id] NVARCHAR(25) NOT NULL PRIMARY KEY,
    [user_id] NVARCHAR(25) NOT NULL,
    [category] NVARCHAR(100) NOT NULL,
    [amount] FLOAT NOT NULL,
    [note] NVARCHAR(500) NULL,
    [date] DATETIME2 NOT NULL,
    [type] NVARCHAR(20) NOT NULL CHECK ([type] IN ('income', 'expense')),
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT [FK_finance_records_user_id] 
        FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) 
        ON DELETE CASCADE
);
GO

-- =============================================
-- 4. BẢNG NOTES (Ghi chú)
-- =============================================
CREATE TABLE [dbo].[notes] (
    [id] NVARCHAR(25) NOT NULL PRIMARY KEY,
    [user_id] NVARCHAR(25) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [tags] NVARCHAR(MAX) NULL, -- JSON array stored as string
    [is_voice] BIT NOT NULL DEFAULT 0,
    [audio_url] NVARCHAR(500) NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT [FK_notes_user_id] 
        FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) 
        ON DELETE CASCADE
);
GO

-- =============================================
-- 5. BẢNG TRANSLATIONS (Bản dịch)
-- =============================================
CREATE TABLE [dbo].[translations] (
    [id] NVARCHAR(25) NOT NULL PRIMARY KEY,
    [user_id] NVARCHAR(25) NOT NULL,
    [input_text] NVARCHAR(MAX) NOT NULL,
    [output_text] NVARCHAR(MAX) NOT NULL,
    [from_lang] NVARCHAR(10) NOT NULL,
    [to_lang] NVARCHAR(10) NOT NULL,
    [is_voice] BIT NOT NULL DEFAULT 0,
    [audio_url] NVARCHAR(500) NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT [FK_translations_user_id] 
        FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) 
        ON DELETE CASCADE
);
GO

-- =============================================
-- INDEXES (Chỉ mục để tối ưu performance)
-- =============================================

-- Indexes cho bảng users
CREATE INDEX [IX_users_email] ON [dbo].[users] ([email]);
GO

-- Indexes cho bảng health_records
CREATE INDEX [IX_health_records_user_id] ON [dbo].[health_records] ([user_id]);
CREATE INDEX [IX_health_records_date] ON [dbo].[health_records] ([date]);
CREATE INDEX [IX_health_records_user_date] ON [dbo].[health_records] ([user_id], [date]);
GO

-- Indexes cho bảng finance_records
CREATE INDEX [IX_finance_records_user_id] ON [dbo].[finance_records] ([user_id]);
CREATE INDEX [IX_finance_records_date] ON [dbo].[finance_records] ([date]);
CREATE INDEX [IX_finance_records_type] ON [dbo].[finance_records] ([type]);
CREATE INDEX [IX_finance_records_category] ON [dbo].[finance_records] ([category]);
CREATE INDEX [IX_finance_records_user_date] ON [dbo].[finance_records] ([user_id], [date]);
GO

-- Indexes cho bảng notes
CREATE INDEX [IX_notes_user_id] ON [dbo].[notes] ([user_id]);
CREATE INDEX [IX_notes_created_at] ON [dbo].[notes] ([created_at]);
CREATE INDEX [IX_notes_is_voice] ON [dbo].[notes] ([is_voice]);
CREATE INDEX [IX_notes_user_created] ON [dbo].[notes] ([user_id], [created_at]);
GO

-- Indexes cho bảng translations
CREATE INDEX [IX_translations_user_id] ON [dbo].[translations] ([user_id]);
CREATE INDEX [IX_translations_created_at] ON [dbo].[translations] ([created_at]);
CREATE INDEX [IX_translations_from_lang] ON [dbo].[translations] ([from_lang]);
CREATE INDEX [IX_translations_to_lang] ON [dbo].[translations] ([to_lang]);
CREATE INDEX [IX_translations_lang_pair] ON [dbo].[translations] ([from_lang], [to_lang]);
GO

-- =============================================
-- TRIGGERS (Trigger để tự động cập nhật updated_at)
-- =============================================

-- Trigger cho bảng users
CREATE TRIGGER [TR_users_updated_at]
ON [dbo].[users]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[users]
    SET [updated_at] = GETDATE()
    FROM [dbo].[users] u
    INNER JOIN inserted i ON u.[id] = i.[id];
END
GO

-- Trigger cho bảng notes
CREATE TRIGGER [TR_notes_updated_at]
ON [dbo].[notes]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[notes]
    SET [updated_at] = GETDATE()
    FROM [dbo].[notes] n
    INNER JOIN inserted i ON n.[id] = i.[id];
END
GO

-- =============================================
-- STORED PROCEDURES (Thủ tục lưu trữ hữu ích)
-- =============================================

-- Stored procedure để lấy thống kê user
CREATE PROCEDURE [dbo].[sp_GetUserStats]
    @UserId NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.[id],
        u.[name],
        u.[email],
        u.[created_at],
        COUNT(DISTINCT hr.[id]) as health_records_count,
        COUNT(DISTINCT fr.[id]) as finance_records_count,
        COUNT(DISTINCT n.[id]) as notes_count,
        COUNT(DISTINCT t.[id]) as translations_count
    FROM [dbo].[users] u
    LEFT JOIN [dbo].[health_records] hr ON u.[id] = hr.[user_id]
    LEFT JOIN [dbo].[finance_records] fr ON u.[id] = fr.[user_id]
    LEFT JOIN [dbo].[notes] n ON u.[id] = n.[user_id]
    LEFT JOIN [dbo].[translations] t ON u.[id] = t.[user_id]
    WHERE u.[id] = @UserId
    GROUP BY u.[id], u.[name], u.[email], u.[created_at];
END
GO

-- Stored procedure để cleanup dữ liệu cũ
CREATE PROCEDURE [dbo].[sp_CleanupOldData]
    @DaysOld INT = 365
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CutoffDate DATETIME2 = DATEADD(DAY, -@DaysOld, GETDATE());
    
    -- Xóa health records cũ
    DELETE FROM [dbo].[health_records] 
    WHERE [created_at] < @CutoffDate;
    
    -- Xóa finance records cũ
    DELETE FROM [dbo].[finance_records] 
    WHERE [created_at] < @CutoffDate;
    
    -- Xóa notes cũ
    DELETE FROM [dbo].[notes] 
    WHERE [created_at] < @CutoffDate;
    
    -- Xóa translations cũ
    DELETE FROM [dbo].[translations] 
    WHERE [created_at] < @CutoffDate;
    
    SELECT @@ROWCOUNT as 'RecordsDeleted';
END
GO

-- =============================================
-- VIEWS (View để truy vấn dễ dàng)
-- =============================================

-- View tổng hợp thông tin user
CREATE VIEW [dbo].[vw_UserSummary]
AS
SELECT 
    u.[id],
    u.[name],
    u.[email],
    u.[age],
    u.[gender],
    u.[created_at],
    COUNT(DISTINCT hr.[id]) as health_records_count,
    COUNT(DISTINCT fr.[id]) as finance_records_count,
    COUNT(DISTINCT n.[id]) as notes_count,
    COUNT(DISTINCT t.[id]) as translations_count
FROM [dbo].[users] u
LEFT JOIN [dbo].[health_records] hr ON u.[id] = hr.[user_id]
LEFT JOIN [dbo].[finance_records] fr ON u.[id] = fr.[user_id]
LEFT JOIN [dbo].[notes] n ON u.[id] = n.[user_id]
LEFT JOIN [dbo].[translations] t ON u.[id] = t.[user_id]
GROUP BY u.[id], u.[name], u.[email], u.[age], u.[gender], u.[created_at];
GO

-- =============================================
-- SAMPLE DATA (Dữ liệu mẫu - tùy chọn)
-- =============================================

-- Thêm user mẫu
INSERT INTO [dbo].[users] ([id], [name], [email], [password], [age], [gender])
VALUES 
    ('user_001', N'Nguyễn Văn A', 'user1@example.com', '$2a$12$hashedpassword', 25, N'Nam'),
    ('user_002', N'Trần Thị B', 'user2@example.com', '$2a$12$hashedpassword', 30, N'Nữ');
GO

-- Thêm health record mẫu
INSERT INTO [dbo].[health_records] ([id], [user_id], [date], [weight], [height], [calories], [sleep], [exercise])
VALUES 
    ('hr_001', 'user_001', GETDATE(), 70.5, 175.0, 2000, 8, N'Chạy bộ 30 phút'),
    ('hr_002', 'user_002', GETDATE(), 55.0, 160.0, 1800, 7, N'Yoga 45 phút');
GO

-- Thêm finance record mẫu
INSERT INTO [dbo].[finance_records] ([id], [user_id], [category], [amount], [note], [date], [type])
VALUES 
    ('fr_001', 'user_001', N'Lương', 15000000, N'Lương tháng 12', GETDATE(), 'income'),
    ('fr_002', 'user_001', N'Ăn uống', 2000000, N'Chi phí ăn uống', GETDATE(), 'expense'),
    ('fr_003', 'user_002', N'Freelance', 8000000, N'Dự án website', GETDATE(), 'income');
GO

-- Thêm note mẫu
INSERT INTO [dbo].[notes] ([id], [user_id], [title], [content], [tags], [is_voice])
VALUES 
    ('note_001', 'user_001', N'Ghi chú công việc', N'Hoàn thành báo cáo tuần này', N'["công việc", "báo cáo"]', 0),
    ('note_002', 'user_002', N'Ý tưởng mới', N'Phát triển ứng dụng mobile', N'["ý tưởng", "mobile"]', 0);
GO

-- Thêm translation mẫu
INSERT INTO [dbo].[translations] ([id], [user_id], [input_text], [output_text], [from_lang], [to_lang], [is_voice])
VALUES 
    ('trans_001', 'user_001', N'Xin chào', 'Hello', 'vi', 'en', 0),
    ('trans_002', 'user_002', 'How are you?', N'Bạn khỏe không?', 'en', 'vi', 0);
GO

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
PRINT '=============================================';
PRINT 'AURA Database Schema created successfully!';
PRINT '=============================================';
PRINT 'Tables created:';
PRINT '- users (Người dùng)';
PRINT '- health_records (Hồ sơ sức khỏe)';
PRINT '- finance_records (Hồ sơ tài chính)';
PRINT '- notes (Ghi chú)';
PRINT '- translations (Bản dịch)';
PRINT '';
PRINT 'Indexes, triggers, stored procedures, and views created.';
PRINT 'Sample data inserted.';
PRINT '';
PRINT 'You can now run: npm run setup:db';
PRINT '=============================================';
GO

