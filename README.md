# 🎓 BN International Academy — School Management & ID Card Studio System

An end-to-end, modern, responsive School Management & Digital ID Card Studio Application built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

![School Management & ID Card Studio Banner](https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

### 🆔 1. Official Digital ID Card Studio & PDF Generator
- **Custom Institutional Branding**:
  - Custom School Logo upload (PNG/JPG/SVG) & preset emblems.
  - Primary Brand Color Picker & palette swatches (Navy Slate, Royal Blue, Emerald Green, Deep Purple, Crimson Red, etc.).
- **Interactive Card Builder**:
  - Live front-side and back-side preview modes with dynamic orientation toggles (**Both Sides**, **Front Only**, **Back Only**).
  - One-click **Clear Form** and **Fill Sample Data** controls for rapid testing.
  - Real-time QR code generation for digital verification.
- **High-Resolution PDF Export**:
  - Instant vector-quality PDF generation powered by `jsPDF` for physical printing and student identification passes.

### 🏫 2. Comprehensive Administration & Roles
- **Role-Based Portals**:
  - **Admin Dashboard**: Analytics, school configuration, fee tracking, and system performance overview.
  - **Teacher Portal**: Class management, attendance logging, gradebook updates, and student evaluations.
  - **Student Portal**: Personal schedule, fee status, assignments, and digital student pass.
- **Roster Management**:
  - Manage student records, class assignments, roll numbers, and parent contacts.
  - Manage faculty profiles, designations, contact details, and department allocations.

### 📑 3. Document Scanner & PDF Tools
- **Built-in Document Scanner**: Scan physical certificates, documents, or homework directly into PDF files with custom page adjustments.

### 📚 4. Academic & Operations Management
- **Library Management**: Book cataloging, borrow/return logs, and overdue tracking.
- **Class Schedules**: Interactive timetable management for all sections and grades.
- **Fee Management**: Fee structure setup, online/offline payment receipts, and collection reports.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark mode support & smooth micro-interactions
- **Icons**: Lucide React (`lucide-react`)
- **PDF Generation**: `jspdf` & `html2canvas`
- **QR Code Engine**: `qrcode`
- **Database & Auth**: Firebase Firestore & Firebase Authentication

---

## 🚀 Getting Started & Local Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/school-management-id-studio.git
cd school-management-id-studio
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` or `.env.local` file in the root directory:
```env
# Optional Firebase Configuration (if connected)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 📂 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── admin/             # Admin Management Modules (Students, Teachers, Fees)
│   │   ├── common/            # Shared components (Header, IDCardStudioView, IDCardTemplate, Scanner)
│   │   ├── dashboard/         # Dashboard Widgets & Analytics Views
│   │   └── teacher/           # Faculty & Class Management Views
│   ├── context/               # Auth & Language React Context Providers
│   ├── lib/                   # Utility helpers, Firebase config & PDF Generator engine
│   ├── types.ts               # Core TypeScript interface definitions
│   ├── App.tsx                # Main Application routing & view engine
│   └── main.tsx               # App entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📄 Exporting & Printing ID Cards

1. Navigate to the **ID Cards** tab in the top navigation bar.
2. Customise the **School Name**, upload/select a **School Logo**, and pick your **Brand Color**.
3. Choose a student/teacher from the roster or enter custom details.
4. Preview the **Front Side** or **Back Side** in real-time.
5. Click **Download PDF** to export a print-ready vector pass with embedded QR code.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to enhance features, add template styles, or optimize workflows.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more details.
