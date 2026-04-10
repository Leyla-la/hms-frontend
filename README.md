# 🏥 HMS Frontend — Hospital Management System

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine_UI-8.x-339AF0?style=for-the-badge&logo=mantine&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A modern, role-based Hospital Management System frontend**  
Built with React 19 · TypeScript · Mantine UI · Redux Toolkit · WebSocket Notifications

[🔗 Backend Repository](https://github.com/Leyla-la/hms-backend) · [📖 API Docs](http://localhost:9000/user/swagger-ui/index.html)

</div>

---

## 🗺️ Role-Based Application Map

```mermaid
graph TD
    LOGIN["🔐 Login / Register"] --> AUTH{JWT Auth}

    AUTH -->|role: ADMIN| ADMIN["👨‍💼 Admin Portal"]
    AUTH -->|role: DOCTOR| DOCTOR["🩺 Doctor Portal"]
    AUTH -->|role: PATIENT| PATIENT["🧑‍⚕️ Patient Portal"]

    subgraph ADMIN_PAGES["👨‍💼 Admin Modules"]
        A1["📊 Dashboard\nKPIs · Revenue · Trends"]
        A2["👨‍⚕️ Doctors\nView & Manage"]
        A3["🧑‍🤝‍🧑 Patients\nView & Manage"]
        A4["💊 Medicine\nCatalog Management"]
        A5["📦 Inventory\nStock & Alerts"]
        A6["🛒 Sales\nTransactions & Reports"]
    end

    subgraph DOCTOR_PAGES["🩺 Doctor Modules"]
        D1["📊 Dashboard\nSchedule Overview"]
        D2["📅 Appointments\nSchedule · Cancel · Rx"]
        D3["🧑‍🤝‍🧑 Patients\nMedical History"]
        D4["💊 Medicine\nPrescription Lookup"]
        D5["🏪 Pharmacy\nSales Interface"]
        D6["👤 Profile\nPersonal & Avatar"]
    end

    subgraph PATIENT_PAGES["🧑‍⚕️ Patient Modules"]
        P1["📊 Dashboard\nHealth Overview"]
        P2["📅 Appointments\nBook · View · Cancel"]
        P3["👤 Profile\nPersonal & Avatar"]
    end

    ADMIN --> ADMIN_PAGES
    DOCTOR --> DOCTOR_PAGES
    PATIENT --> PATIENT_PAGES

    style LOGIN fill:#6366F1,color:#fff,stroke:#4F46E5
    style AUTH fill:#F59E0B,color:#fff,stroke:#D97706
    style ADMIN fill:#EF4444,color:#fff,stroke:#DC2626
    style DOCTOR fill:#10B981,color:#fff,stroke:#059669
    style PATIENT fill:#3B82F6,color:#fff,stroke:#2563EB
    style ADMIN_PAGES fill:#FEE2E2,color:#111,stroke:#EF4444
    style DOCTOR_PAGES fill:#D1FAE5,color:#111,stroke:#10B981
    style PATIENT_PAGES fill:#DBEAFE,color:#111,stroke:#3B82F6
```

---

## 🔔 Real-Time Notification Flow

```mermaid
sequenceDiagram
    participant BE as ⚙️ Backend Event
    participant KF as 📨 Kafka
    participant NS as 🔔 Notification MS
    participant WS as 🌐 WebSocket<br/>(STOMP)
    participant UI as ⚛️ HMS Frontend

    BE->>KF: Publish event<br/>(appointment booked, etc.)
    KF->>NS: Consume & persist notification
    NS->>WS: Push to /topic/notifications
    WS->>UI: Receive notification payload
    UI->>UI: Update bell icon badge 🔔
    UI->>UI: Show toast notification
    UI->>UI: Update notification list
```

---

## ✨ Features by Role

### 👨‍💼 Admin
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Live KPI cards — Revenue, Total Patients, Doctors, Appointments |
| 📈 Analytics | Appointment trends chart, Inventory health, Top medicines/patients |
| 🔔 Live Alerts | Real-time notifications via WebSocket |
| 👨‍⚕️ Doctors | Full doctor management with profile details |
| 🧑‍🤝‍🧑 Patients | Patient list with appointment history |
| 💊 Medicine | Medicine catalog CRUD |
| 📦 Inventory | Stock management with low-stock alerts |
| 🛒 Sales | Sales records, prescription-linked transactions |

### 🩺 Doctor
| Feature | Description |
|---------|-------------|
| 📅 Appointments | View scheduled appointments, write clinical records |
| 📝 Prescriptions | Issue prescriptions linked to appointments |
| 📋 Medical History | View patient's complete appointment history (COMPLETED only) |
| 🧑‍🤝‍🧑 Patients | View patient profiles from their appointments |
| 💊 Medicine | Lookup medicine catalog for prescription guidance |
| 🏪 Pharmacy | Access pharmacy sales linked to their prescriptions |
| 🖼️ Avatar | Upload & update profile picture |

### 🧑‍⚕️ Patient
| Feature | Description |
|---------|-------------|
| 📅 Appointments | Book new appointments, view upcoming & past |
| ❌ Cancel | Cancel upcoming appointments with confirmation |
| 📊 Dashboard | Personal health overview — upcoming visits, history count |
| 🖼️ Avatar | Upload & update profile picture |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- Running HMS Backend (see [Backend README](https://github.com/Leyla-la/hms-backend))

---

### 💻 Run Locally

```bash
# 1. Clone
git clone https://github.com/Leyla-la/hms-frontend.git
cd hms-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.backup .env
# Edit .env.local with your backend URL if different from localhost

# 4. Start development server
npm start
```

App runs at: **http://localhost:3000**

> Make sure the backend API Gateway is running at `http://localhost:9000`

---

### 🐳 Run with Docker

```bash
# 1. Build production bundle
npm run build

# 2. Build Docker image
docker build -t hms-frontend .

# 3. Run container
docker run -d -p 80:80 --name hms-web hms-frontend
```

App accessible at: **http://localhost**

---

## 🌱 Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:9000` | API Gateway base URL |
| `REACT_APP_WS_URL` | `ws://localhost:9000/ws` | WebSocket endpoint |
| `REACT_APP_MEDIA_URL` | `http://localhost:9400` | Media service base URL |

---

## 🗂️ Project Structure

```
src/
├── 📁 Components/
│   ├── Admin/          # Admin-specific pages (Dashboard, Doctors, Sales...)
│   ├── Doctor/         # Doctor-specific pages (Appointments, Patients...)
│   ├── Patient/        # Patient-specific pages
│   ├── Common/         # Shared components (PageHeader)
│   ├── Dashboard/      # Reusable dashboard widgets (KpiCard, Charts...)
│   ├── Header/         # Top navigation + Notifications bell
│   ├── Sidebar/        # Role-based sidebar navigation
│   └── Utility/        # AvatarUploadModal, ProfileAvatar, Dropzone
│
├── 📁 Pages/
│   ├── Admin/          # Page wrappers for Admin routes
│   ├── Doctor/         # Page wrappers for Doctor routes
│   └── Patient/        # Page wrappers for Patient routes
│
├── 📁 Service/
│   ├── UserService.tsx
│   ├── AppointmentService.tsx
│   ├── DashboardService.tsx
│   ├── MedicineService.tsx
│   ├── InventoryService.tsx
│   ├── SalesService.tsx
│   ├── MediaService.tsx
│   ├── NotificationService.tsx
│   └── StompClient.tsx       # WebSocket STOMP setup
│
├── 📁 Slices/          # Redux state slices (Auth, Profile)
├── 📁 Utility/         # AuthBootstrap, PrescriptionUtil, Store
├── 📁 Interceptor/     # AxiosInterceptor (JWT injection)
├── 📁 Routes/          # AppRoutes (protected, role-based)
├── 📁 hooks/           # useNotifications (WebSocket hook)
└── 📁 Utils/           # DataUtils (formatting helpers)
```

---

## ⚙️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Language | TypeScript 5 |
| State Management | Redux Toolkit 2 + React Redux |
| UI Component Library | **Mantine UI 8** (Core, Forms, Modals, Notifications) |
| Icons | Tabler Icons React |
| HTTP Client | Axios 1 + Interceptor |
| Routing | React Router DOM 7 |
| WebSocket | STOMP over SockJS |
| JWT | jwt-decode |
| Date Handling | Day.js |
| Phone Input | react-phone-number-input |
| Build Tool | Create React App (react-scripts) |
| Production Server | Nginx (via Docker) |

---

## 🧭 Routing Structure

```mermaid
graph LR
    ROOT["/"] --> LOGIN["/login"]
    ROOT --> REGISTER["/register"]

    ROOT --> ADMIN["/admin/*\n🔒 Role: ADMIN"]
    ROOT --> DOCTOR["/doctor/*\n🔒 Role: DOCTOR"]
    ROOT --> PATIENT["/patient/*\n🔒 Role: PATIENT"]
    ROOT --> NOT_FOUND["/* → 404 Page"]

    ADMIN --> AD["dashboard"]
    ADMIN --> AD2["doctors"]
    ADMIN --> AD3["patients"]
    ADMIN --> AD4["medicine"]
    ADMIN --> AD5["inventory"]
    ADMIN --> AD6["sales"]

    DOCTOR --> DC["dashboard"]
    DOCTOR --> DC2["appointments"]
    DOCTOR --> DC3["patients"]
    DOCTOR --> DC4["medicine"]
    DOCTOR --> DC5["pharmacy"]
    DOCTOR --> DC6["profile"]

    PATIENT --> PT["dashboard"]
    PATIENT --> PT2["appointments"]
    PATIENT --> PT3["profile"]

    style ADMIN fill:#FEE2E2,color:#111,stroke:#EF4444
    style DOCTOR fill:#D1FAE5,color:#111,stroke:#10B981
    style PATIENT fill:#DBEAFE,color:#111,stroke:#3B82F6
    style NOT_FOUND fill:#F3F4F6,color:#111
```

---

## 🤝 Contributing

```bash
# Create feature branch
git checkout -b feat/your-feature

# Commit using Conventional Commits
git commit -m "feat(scope): your description"

# Push to remote
git push origin feat/your-feature
```

**Branch conventions:** `feat/` · `fix/` · `refactor/` · `chore/`

---

<div align="center">

Built with ❤️ · React · TypeScript · Mantine UI · Real-time WebSocket

</div>
