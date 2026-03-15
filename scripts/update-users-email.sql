-- =============================================
-- Update users_barcode table for email features
-- Run this script once against your MSSQL server
-- =============================================
USE system_DB;
GO

-- Add email column (not null if we want all new users to have it, but for migration we keep it nullable or set default)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_barcode') AND name = 'email')
BEGIN
    ALTER TABLE users_barcode ADD email NVARCHAR(255);
    PRINT 'Column email added.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_barcode') AND name = 'is_verified')
BEGIN
    ALTER TABLE users_barcode ADD is_verified BIT DEFAULT 0;
    PRINT 'Column is_verified added.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_barcode') AND name = 'verification_token')
BEGIN
    ALTER TABLE users_barcode ADD verification_token NVARCHAR(255);
    PRINT 'Column verification_token added.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_barcode') AND name = 'reset_token')
BEGIN
    ALTER TABLE users_barcode ADD reset_token NVARCHAR(255);
    PRINT 'Column reset_token added.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_barcode') AND name = 'reset_token_expires')
BEGIN
    ALTER TABLE users_barcode ADD reset_token_expires DATETIME2;
    PRINT 'Column reset_token_expires added.';
END
GO
