import sql from "mssql";

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE!,
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Reuse connection pool across requests in dev (hot reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _mssqlPool: sql.ConnectionPool | undefined;
}

async function getPool(): Promise<sql.ConnectionPool> {
  if (global._mssqlPool && global._mssqlPool.connected) {
    return global._mssqlPool;
  }
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  global._mssqlPool = pool;
  return pool;
}

export async function queryByBarcode(
  barcode: string,
): Promise<null | { data: Record<string, unknown>; qty: number }> {
  const table = process.env.DB_TABLE;
  const barcodeCol = process.env.DB_BARCODE_COLUMN;
  const columnsEnv = process.env.DB_COLUMNS || "";
  const qtyCol = process.env.DB_QTY_COLUMN; // ✅ NEW

  if (!table || !barcodeCol) {
    throw new Error(
      "DB_TABLE and DB_BARCODE_COLUMN must be set in environment variables",
    );
  }

  const columns = columnsEnv
    ? columnsEnv
        .split(",")
        .map((c) => `[${c.trim()}]`)
        .join(", ")
    : "*";

  // ✅ Pull qty from env column, fallback to 1 if not set
  const qtySelect = qtyCol
    ? `, TRY_CONVERT(float, [${qtyCol}]) AS __qty`
    : `, CAST(1 AS float) AS __qty`;

  const pool = await getPool();
  const result = await pool
    .request()
    .input("barcode", sql.VarChar(255), barcode)
    .query(
      `SELECT TOP 1 ${columns}${qtySelect}
       FROM [${table}]
       WHERE [${barcodeCol}] = @barcode`,
    );

  const row = result.recordset[0];
  if (!row) return null;

  const qtyRaw = Number((row as any).__qty);
  const qty = Number.isFinite(qtyRaw) ? qtyRaw : 1;

  delete (row as any).__qty;

  return { data: row, qty };
}

export async function saveLayNoForRollBarcodes(
  layNo: string,
  barcodes: string[],
): Promise<number> {
  const cleanLay = layNo.trim();
  const cleanBarcodes = Array.from(
    new Set(barcodes.map((b) => String(b || "").trim()).filter(Boolean)),
  );

  if (!cleanLay) throw new Error("Lay No is empty");
  if (cleanBarcodes.length === 0) throw new Error("No barcodes provided");

  const pool = await getPool();
  const req = pool.request();

  req.input("layNo", sql.NVarChar(100), cleanLay);

  // build safe IN list with parameters
  const params: string[] = [];
  cleanBarcodes.forEach((b, i) => {
    const name = `b${i}`;
    req.input(name, sql.VarChar(255), b);
    params.push(`@${name}`);
  });

  const q = `
    UPDATE act_trn_05
    SET LAY_NO = @layNo
    WHERE ACT_CODE = 'ACT_514' AND roll_barcode IN (${params.join(",")})
  `;

  const result = await req.query(q);
  return result.rowsAffected?.[0] ?? 0;
}
