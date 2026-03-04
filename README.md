t # 📷 ScanDB — Next.js Barcode Scanner + MSSQL

A mobile-friendly **Next.js 14** app that scans **Code 39** barcodes via phone camera and looks up records from a **MSSQL** database in real time.

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirects to /scanner
│   ├── globals.css             # Global styles + Tailwind
│   ├── scanner/
│   │   └── page.tsx            # Scanner page
│   └── api/
│       └── lookup/
│           └── route.ts        # POST /api/lookup — queries MSSQL
├── components/
│   └── ScannerClient.tsx       # Full scanner UI (client component)
└── lib/
    └── db.ts                   # MSSQL connection pool + query helper
```

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost            # or your server IP
DB_DATABASE=your_database
DB_PORT=1433
DB_ENCRYPT=false               # true for Azure SQL
DB_TRUST_CERT=true

DB_TABLE=your_table_name
DB_BARCODE_COLUMN=barcode_column_name

# Optional: limit returned columns (comma-separated)
# DB_COLUMNS=Name,Price,Stock
DB_COLUMNS=
```

### 3. Run development server
```bash
npm run dev
```

Open `http://localhost:3000` (or your local IP on your phone).

---

## 📱 How to use on your phone

1. Make sure your phone is on the same WiFi as your dev machine
2. Find your machine's local IP (e.g. `192.168.1.100`)
3. Open `http://192.168.1.100:3000` on your phone
4. Tap **Start Camera**, allow camera access
5. Point at a Code 39 barcode — result appears instantly

---

## 🌐 Deployment

Since this app needs a Node.js backend (for MSSQL), you **cannot** deploy to Netlify or GitHub Pages. Use:

| Platform | Notes |
|---|---|
| **Railway** | Easiest — connects env vars via dashboard |
| **Render** | Free tier available |
| **Vercel** | Works but MSSQL must be reachable from Vercel's servers |
| **VPS/Docker** | Full control |

### Deploy to Railway
1. Push to GitHub
2. Create new Railway project → Deploy from GitHub
3. Add all env vars from `.env.example` in the Railway dashboard
4. Railway auto-detects Next.js and builds it

---

## 🛡 Security Notes

- Never commit `.env.local`
- For production, ensure MSSQL is not publicly exposed — use a private network or VPN
- Consider adding API authentication if the app is publicly accessible
