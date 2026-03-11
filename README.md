# KTC Scanner Hub 🚀

A premium, modern **Next.js 15 barcode scanning ecosystem** designed for high-performance production, warehouse management, and Quality Control (QC) environments.

The system provides two distinct specialized workspaces:

1.  **Add Rolls to Lay No**: For tracking production batches and building lay reports.
2.  **Roll QC (Premium)**: A detailed inspection module with RTL PDF generation and Arabic status mapping.

---

## ✨ Key Features

### 📸 Advanced Barcode Scanning

- **Real-time Camera Scan**: Powered by **ZXing** for rapid, accurate detection.
- **Manual Entry**: Fallback for damaged labels with instant database validation.
- **Duplicate Prevention**: Integrated logic to ensure each roll is added only once per session.
- **Smart Loading**: Automatically retrieves and locks existing rolls when a Lay No is entered.

### 🧪 Roll QC (ERP Module)

- **RTL Deep Support**: Fully localized PDF reports with Right-to-Left layout.
- **Arabic Status Mapping**: Automatically converts ERP status codes (e.g., `01`, `04`) into readable Arabic descriptions (e.g., `جديد`, `مقبول`).
- **Visual Barcodes**: Generates high-resolution graphical barcodes within the PDF for easy rescanning.
- **Defect Tracking**: Comprehensive grids for both Knitting (KNT) and Dyeing (DYE) defect codes.

### 📊 Intelligent Weight Calculations

The system implements specialized summation logic for precise reporting:

- **Net Weight (QTY)**: Automatically sums `QTY_02` + `QTY_04`.
- **Gross Weight (QTY GRS)**: Automatically sums `QTY_05` + `QTY_06`.
- **Live Totals**: Real-time calculation of totals in the UI "PDF Cart" before export.

### 🎨 Premium UI/UX

- **Glassmorphism Design**: Sleek, translucent cards with glowing background accents.
- **Full Dark Mode**: Seamlessly switches between light and dark themes via `next-themes`.
- **Micro-animations**: Interactive hover effects and smooth transitions for a premium feel.
- **Responsive Layout**: Optimized for mobile industrial scanners and desktop terminals alike.

---

## 🛠 Tech Stack

| Tier            | Technologies                                               |
| :-------------- | :--------------------------------------------------------- |
| **Frontend**    | Next.js 15 (App Router), React 19, Tailwind CSS v4         |
| **State/Theme** | `next-themes`, Lucide React, Framer Motion (Glassmorphism) |
| **Scanning**    | `@zxing/library`                                           |
| **Database**    | **MSSQL** (Microsoft SQL Server) with Connection Pooling   |
| **Reporting**   | `jsPDF`, `jspdf-autotable`, `jsbarcode`                    |

---

## 📂 Project Architecture

```
Barcode_ktc-main
 ├ app
 │  ├ (pages)
 │  │  ├ def/             # Add Rolls to Lay No Scanner
 │  │  └ erp/             # Roll QC (ERP) Scanner
 │  ├ api/
 │  │  ├ lookup/          # Single barcode validation
 │  │  ├ save-lay/        # Batch Lay No updates
 │  │  ├ lay-lookup/      # Retrieving existing Lay rolls
 │  │  └ erp-rolls/       # Batch data for QC reports
 │  └ layout.tsx          # Global SEO, Themes, and Font Config
 │
 ├ components
 │  ├ scanner/            # Core scanner logic & hooks
 │  ├ cards/              # Premium UI components (Headers, Cart, Manual)
 │  ├ results/            # Specialized result cards (Standard & ERP)
 │  └ utils/              # PDF & ERP-PDF generation logic
 │
 ├ lib/
 │  └ db.ts               # Parameterized SQL queries & Pooling
 └ public/
    ├ fonts/              # Amiri Arabic font support
    └ logo.png            # Brand assets
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Credentials
DB_USER="your_user"
DB_PASSWORD="your_password"
DB_SERVER="your_server_ip"
DB_DATABASE="your_database_name"
DB_PORT=1433

# Dynamic Table Configuration
DB_TABLE="act_trn_05"
DB_BARCODE_COLUMN="roll_barcode"
DB_COLUMNS="WO_NO,JO_NO,QTY_02,QTY_04,QTY_05,QTY_06"
```

---

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Development Mode**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

---

## 📖 Operational Workflow

1.  **Select Workspace**: Choose between "Add Rolls to Lay No" or "Roll QC" from the landing page.
2.  **Identification**: Enter a **Lay No** or scan your first roll.
3.  **Validation**: Review roll details on the interactive cards.
4.  **Action**:
    - In **Lay No**: Hit **Add** to queue for the batch.
    - In **Roll QC**: View defects and hit **Export** for a detailed individual report.
5.  **Finalize**: Export the report; the system automatically updates the database in the background.

---

### 🏛 Developed by KTC Production Systems

_Optimized for reliability, speed, and professional documentation._
