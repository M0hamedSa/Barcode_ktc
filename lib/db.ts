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
      `SELECT ${columns}${qtySelect}
      FROM [${table}]
      WHERE ACT_CODE = 'ACT_514' AND [${barcodeCol}] = @barcode`,
    );

  const row = result.recordset[0];
  if (!row) return null;

  const rowData = row as Record<string, unknown>;
  const qtyRaw = Number(rowData.__qty);
  const qty = Number.isFinite(qtyRaw) ? qtyRaw : 1;

  delete rowData.__qty;

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

export async function getRollsByLayNo(layNo: string) {
  const pool = await getPool();

  const result = await pool.request().input("layNo", sql.VarChar(50), layNo)
    .query(`
      SELECT
        ROLL_BARCODE,
        WO_NO,
        JO_NO,
        QTY_02,
        QTY_04,
        QTY_05,
        QTY_06,
        ACT_DATA_08,
        ACT_DATA_09,
        ACT_DATA_07
      FROM act_trn_05
      WHERE LAY_NO = @layNo AND ACT_CODE = 'ACT_514'
    `);

  return result.recordset;
}

export async function getErpRolls(barcode: string[]) {
  const pool = await getPool();
  const json = JSON.stringify(barcode);

  const result = await pool
    .request()
    .input("barcodesJson", sql.NVarChar(sql.MAX), json).query(`
SELECT 
      WO_NO, JO_NO, COLOR_CODE, COLOR_DESC, DYE_DOC_STATUS, KNT_DOC_STATUS,      
      ROLL_BARCODE, DEFECT_01, DEFECT_02, DEFECT_03, DEFECT_04, DEFECT_05, DEFECT_06, DEFECT_07, DEFECT_08, DEFECT_09, DEFECT_10, DEFECT_11, DEFECT_12, DEFECT_13, DEFECT_14, DEFECT_15, 
      DEFECT_16, DEFECT_17, DEFECT_18, DEFECT_19, DEFECT_20, DYE_DEFECT_01, DYE_DEFECT_02, DYE_DEFECT_03, DYE_DEFECT_04, DYE_DEFECT_05, DYE_DEFECT_06, DYE_DEFECT_07, DYE_DEFECT_08, 
      DYE_DEFECT_09, DYE_DEFECT_10, DYE_DEFECT_11, DYE_DEFECT_12, DYE_DEFECT_13, DYE_DEFECT_14, DYE_DEFECT_15, DYE_DEFECT_16, DYE_DEFECT_17, DYE_DEFECT_18, DYE_DEFECT_19, DYE_DEFECT_20, 
      DYE_DEFECT_21, DYE_DEFECT_22, DYE_DEFECT_23, DYE_DEFECT_24
      FROM ERP_ROLL_DATA
      WHERE ROLL_BARCODE IN (
        SELECT value FROM OPENJSON(@barcodesJson)
      )
    `);

  return result.recordset;
}
