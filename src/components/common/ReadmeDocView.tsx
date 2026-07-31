import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Github,
  BookOpen,
  Sparkles,
  ShieldCheck,
  QrCode,
  Camera,
  School,
  Terminal,
  Layers,
  CheckCircle2
} from 'lucide-react';

const README_MARKDOWN_CONTENT = `# 🎓 BN International Academy — School Management & ID Card Studio System

An end-to-end, modern, responsive School Management & Digital ID Card Studio Application built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

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
  - Instant vector-quality PDF generation powered by \`jsPDF\` for physical printing and student identification passes.

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
- **Icons**: Lucide React (\`lucide-react\`)
- **PDF Generation**: \`jspdf\` & \`html2canvas\`
- **QR Code Engine**: \`qrcode\`
- **Database & Auth**: Firebase Firestore & Firebase Authentication

---

## 🚀 Getting Started & Local Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Step 1: Clone the Repository
\`\`\`bash
git clone https://github.com/your-username/school-management-id-studio.git
cd school-management-id-studio
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 3: Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open your browser and navigate to \`http://localhost:3000\`.

---

## 📜 License
Distributed under the MIT License. See \`LICENSE\` for more details.
`;

export const ReadmeDocView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(README_MARKDOWN_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([README_MARKDOWN_CONTENT], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'README.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              <span>GitHub-Ready Repository Docs</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Project README.md Documentation
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Complete project summary, architecture documentation, setup instructions, and feature guide formatted for GitHub export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Markdown!' : 'Copy README.md'}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download README.md</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/80 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">ID Card Studio</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Branding color engine, custom logos, front/back live preview, and high-res vector PDF export.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/80 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
            <School className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">School Operations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student & Teacher rosters, attendance logging, fee management, timetables, and library tracking.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Doc Scanner</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan paper certificates or forms directly into formatted multi-page PDF documents.
          </p>
        </div>
      </div>

      {/* Markdown Document Display */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            <FileCode className="w-4 h-4 text-blue-500" />
            <span>README.md</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Standard GitHub Format</span>
        </div>

        <div className="p-6 md:p-8 font-mono text-xs md:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-950 text-slate-100 p-6 rounded-b-2xl">
          {README_MARKDOWN_CONTENT}
        </div>
      </div>
    </div>
  );
};
