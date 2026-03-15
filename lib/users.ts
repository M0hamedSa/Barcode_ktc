import sql from "mssql";

// Separate connection config for system_DB (users)
const authConfig: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.AUTH_DATABASE!,
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Reuse connection pool across requests (hot reload safe)
declare global {
  var _authPool: sql.ConnectionPool | undefined;
}

async function getAuthPool(): Promise<sql.ConnectionPool> {
  if (global._authPool && global._authPool.connected) {
    return global._authPool;
  }
  const pool = new sql.ConnectionPool(authConfig);
  await pool.connect();
  global._authPool = pool;
  return pool;
}

export interface DbUser {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  role: string;
  is_verified: boolean;
  is_approved: boolean;
  verification_token: string | null;
  reset_token: string | null;
  reset_token_expires: Date | null;
  created_at: Date;
}

export async function findUserByUsername(
  username: string,
): Promise<DbUser | null> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("username", sql.NVarChar(100), username)
    .query("SELECT * FROM users_barcode WHERE username = @username");
  return result.recordset[0] || null;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(255), email)
    .query("SELECT * FROM users_barcode WHERE email = @email");
  return result.recordset[0] || null;
}

export async function findUserById(id: number): Promise<DbUser | null> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM users_barcode WHERE id = @id");
  return result.recordset[0] || null;
}

export async function findUserByVerificationToken(
  token: string,
): Promise<DbUser | null> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("token", sql.NVarChar(255), token)
    .query("SELECT * FROM users_barcode WHERE verification_token = @token");
  return result.recordset[0] || null;
}

export async function findUserByResetToken(
  token: string,
): Promise<DbUser | null> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("token", sql.NVarChar(255), token)
    .query("SELECT * FROM users_barcode WHERE reset_token = @token");

  const user = (result.recordset[0] as DbUser) || null;

  if (user && user.reset_token_expires) {
    const expires = new Date(user.reset_token_expires);
    if (expires < new Date()) {
      return null;
    }
  }

  return user;
}

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  verificationToken: string,
  role: string = "user",
): Promise<DbUser> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("username", sql.NVarChar(100), username)
    .input("email", sql.NVarChar(255), email)
    .input("passwordHash", sql.NVarChar(255), passwordHash)
    .input("role", sql.NVarChar(20), role)
    .input("verificationToken", sql.NVarChar(255), verificationToken)
    .query(
      `INSERT INTO users_barcode (username, email, password_hash, role, verification_token, is_approved)
       OUTPUT INSERTED.*
       VALUES (@username, @email, @passwordHash, @role, @verificationToken, 0)`,
    );
  return result.recordset[0];
}

export async function verifyUserEmail(userId: number): Promise<boolean> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(
      "UPDATE users_barcode SET is_verified = 1, verification_token = NULL WHERE id = @userId",
    );
  return (result.rowsAffected?.[0] ?? 0) > 0;
}

export async function setResetToken(
  email: string,
  token: string,
  expires: Date,
): Promise<boolean> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar(255), email)
    .input("token", sql.NVarChar(255), token)
    .input("expires", sql.DateTime2, expires)
    .query(
      "UPDATE users_barcode SET reset_token = @token, reset_token_expires = @expires WHERE email = @email",
    );
  return (result.rowsAffected?.[0] ?? 0) > 0;
}

export async function resetPassword(
  userId: number,
  newPasswordHash: string,
): Promise<boolean> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("passwordHash", sql.NVarChar(255), newPasswordHash)
    .query(
      "UPDATE users_barcode SET password_hash = @passwordHash, reset_token = NULL, reset_token_expires = NULL WHERE id = @userId",
    );
  return (result.rowsAffected?.[0] ?? 0) > 0;
}

export async function listUsers(): Promise<Omit<DbUser, "password_hash">[]> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .query(
      "SELECT id, username, email, role, is_verified, is_approved, created_at FROM users_barcode ORDER BY created_at DESC",
    );
  return result.recordset;
}

export async function approveUser(id: number): Promise<boolean> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("UPDATE users_barcode SET is_approved = 1 WHERE id = @id");
  return (result.rowsAffected?.[0] ?? 0) > 0;
}

export async function deleteUser(id: number): Promise<boolean> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM users_barcode WHERE id = @id");
  return (result.rowsAffected?.[0] ?? 0) > 0;
}

export async function updateUserRole(
  id: number,
  role: string,
): Promise<boolean> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("role", sql.NVarChar(20), role)
    .query("UPDATE users_barcode SET role = @role WHERE id = @id");
  return (result.rowsAffected?.[0] ?? 0) > 0;
}
