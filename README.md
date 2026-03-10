# Barcode Scanner Web App

A modern **Next.js barcode scanning application** designed for warehouse and production environments.

The system scans roll barcodes, retrieves data from **Microsoft SQL Server**, allows operators to build a **Lay report**, and exports a **professional PDF report**.

---

# Features

## Barcode Scanning

- Real-time camera barcode scanning using **ZXing**
- Manual barcode entry supported
- Duplicate scans are automatically prevented

## Database Integration

- Connects to **Microsoft SQL Server**
- Retrieves roll information from database
- Loads existing rolls for a Lay automatically

## Lay No Workflow

When a user enters a **Lay No**:

1. Existing rolls with the same Lay No are retrieved from the database
2. They appear in the result list
3. These rolls are **locked** and cannot be removed
4. Operators can **scan additional rolls** normally

This ensures previously saved rolls remain part of the report.

---

# Roll Selection Logic

| Type                  | Behavior                   |
| --------------------- | -------------------------- |
| Existing roll from DB | Locked (cannot be removed) |
| New scanned roll      | Can be added/removed       |
| Duplicate scan        | Automatically ignored      |

---

# Result Cards

Each scanned roll shows:

- Barcode
- WO Number
- JO Number
- QTY_02
- QTY_04
- Additional roll details

Result cards include:

- Expand / Collapse animation
- Copy barcode button
- Add / Remove button
- Locked indicator for existing rolls

---

# PDF Report

The system generates a professional **Lay Report PDF** containing:

- Company logo
- Lay Number
- Date & Time
- Barcode table
- QTY_02 per roll
- QTY_04 per roll

### Totals included

- Total Rolls
- Total QTY_02
- Total QTY_04

Example layout:

```
[Company Logo]

Barcode Scan Report
Lay No: 1450
Date: 2026-03-07

---------------------------------------------
| Barcode | WO | JO | QTY_02 | QTY_04 |
---------------------------------------------
| ...                                   |
| ...                                   |
---------------------------------------------

Total Rolls : 25
Total QTY_02: 850
Total QTY_04: 960
```

---

# Saving Lay No to Database

When exporting the PDF:

1. Selected rolls are collected
2. API `/api/save-lay` is called
3. Database updates:

```
act_trn_05.ACT_KEY_01 = Lay No
WHERE ROLL_BARCODE IN (...)
```

Only **newly added rolls** are updated.

---

# Tech Stack

| Technology      | Purpose               |
| --------------- | --------------------- |
| Next.js 15      | Frontend + API routes |
| React           | UI components         |
| Tailwind CSS    | Styling               |
| ZXing           | Barcode scanning      |
| MSSQL           | Database              |
| jsPDF           | PDF generation        |
| jspdf-autotable | Table rendering       |

---

# Project Structure

```
src
 ├ app
 │  └ api
 │     ├ lookup
 │     ├ save-lay
 │     └ lay-lookup
 │
 ├ components
 │  └ scanner
 │     ├ cards
 │     │   ├ CameraCard.tsx
 │     │   ├ LayNoCard.tsx
 │     │   ├ PdfCartCard.tsx
 │     │   └ PageHeader.tsx
 │     │
 │     ├ results
 │     │   ├ ResultCard.tsx
 │     │   └ ResultsSection.tsx
 │     │
 │     ├ hooks
 │     │   ├ useToast.ts
 │     │   └ useZxingScanner.ts
 │     │
 │     ├ utils
 │     │   ├ api.ts
 │     │   └ pdf.ts
 │     │
 │     └ types.ts
 │
 └ lib
    └ db.ts
```

---

# Environment Variables

Create `.env.local`

```
DB_USER=
DB_PASSWORD=
DB_SERVER=
DB_DATABASE=
DB_PORT=1433

DB_TABLE=act_trn_05
DB_BARCODE_COLUMN=ROLL_BARCODE

DB_COLUMNS=WO_NO,JO_NO,ACT_DATA_08,ACT_DATA_09,ACT_DATA_07,QTY_02,QTY_04
```

---

# Running the Project

Install dependencies

```
npm install
```

Run development server

```
npm run dev
```

Open

```
http://localhost:3000
```

---

# Deployment

Recommended deployment:

**Vercel**

Steps:

1. Push repository to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

# Recommended Workflow for Operators

1. Enter **Lay No**
2. System loads existing rolls
3. Scan new rolls
4. Press **Add** on valid rolls
5. Click **Export PDF**
6. Lay report is generated and database updated

---

# Security Notes

- SQL queries use **parameterized inputs**
- Duplicate barcode scanning is prevented
- Existing Lay rolls are **locked**

---

# Future Improvements

Potential upgrades:

- Duplicate barcode detection warning
- Multi-page PDF with page numbers
- Landscape PDF layout
- Scan history export
- Barcode validation rules
- Operator login system

---

# Author

Developed for **production roll tracking and lay reporting systems**.
