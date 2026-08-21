# BcaFly — BCA Department Academic Management Platform

> Centralized Academic Workspaces across all Six BCA Semesters with Role-Based Access Governance.

---

## 🏛️ System Overview

BcaFly supports all six BCA semesters (`[ Semester 1 ]` through `[ Semester 6 ]`) with independent academic configurations and strict data isolation across four separate platforms:

1. **👑 Administrator Platform**: Full institutional oversight, course catalogue management, semester enrolment rosters, faculty assignments, timetable matrix, and student promotion engine.
2. **📊 HOD Platform**: Department-wide academic monitoring, approvals queue (activities & OD requests), backlog/remedial register, and analytical reporting.
3. **👨‍🏫 Faculty Platform**: Course management for assigned semester offerings, class attendance entry with one-click commit, continuous internal marks entry, and class performance reports.
4. **🎓 Student Platform**: Personal enrolment ledger, semester-wise attendance breakdowns (75% threshold tracking), internal assessment marks, official examination transcripts, and verified portfolio exports (PDF with QR ID).

---

## 📂 Repository Structure

```
├── index.html                   # Direct standalone SPA for instant static deployment
├── vercel.json                  # Vercel deployment configuration
├── package.json                 # Monorepo root scripts
├── register-bca-dashboard.html  # Standalone backup bundle
├── academic-management-system/
│   ├── frontend/                # React 19 + Vite + Tailwind CSS client
│   ├── backend/                 # Spring Boot 3 Java service layer
│   ├── worker/                  # Python background task worker
│   ├── database/                # PostgreSQL migration scripts (V1 to V5)
│   └── docker-compose.yml       # Local multi-container deployment configuration
```

---

## 🚀 Local Development

### Option 1: Run Vite Frontend Server
```bash
cd academic-management-system/frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Option 2: Full Docker Stack (Frontend + Spring Boot Backend + Postgres)
```bash
cd academic-management-system
docker-compose up -d
```

---

## ☁️ Vercel Deployment (Private / View-Only Access)

1. Import this repository into **[Vercel](https://vercel.com/)**.
2. Vercel will automatically build and deploy the application.
3. **For Private / View-Only Access**:
   - Go to **Project Settings $\rightarrow$ Deployment Protection**.
   - Enable **Password Protection** or **Vercel Authentication**.
