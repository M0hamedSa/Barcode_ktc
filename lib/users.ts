import sql from "mssql";

// Separate connection config for system_DB (users)
const authConfig: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER || "localhost",
  database: "system_DB",
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
  password_hash: string;
  role: string;
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

export async function findUserById(id: number): Promise<DbUser | null> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM users_barcode WHERE id = @id");
  return result.recordset[0] || null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  role: string = "user",
): Promise<DbUser> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .input("username", sql.NVarChar(100), username)
    .input("passwordHash", sql.NVarChar(255), passwordHash)
    .input("role", sql.NVarChar(20), role)
    .query(
      `INSERT INTO users_barcode (username, password_hash, role)
       OUTPUT INSERTED.*
       VALUES (@username, @passwordHash, @role)`,
    );
  return result.recordset[0];
}

export async function listUsers(): Promise<Omit<DbUser, "password_hash">[]> {
  const pool = await getAuthPool();
  const result = await pool
    .request()
    .query(
      "SELECT id, username, role, created_at FROM users_barcode ORDER BY created_at DESC",
    );
  return result.recordset;
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
