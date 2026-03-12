# 🎯 Tictify — University & Student Opportunity Platform

> A centralized platform for Pakistani university students to discover hackathons, scholarships, workshops, and competitions.

## 👥 Team
| Member | Roll No |
|--------|---------|
| Mirfaq Javaid | 23L-3061 |
| Jabeen Zahra | 23L-3065 |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google OAuth 2.0 |
| Email | Nodemailer (dev) / SendGrid (prod) |

---

## 📁 Project Structure

```
tictify/
├── backend/                  # Express + Node.js API
│   ├── src/
│   │   ├── config/           # DB, env, constants
│   │   ├── controllers/      # Route handlers (business logic)
│   │   ├── middleware/        # Auth, error handling, validation
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Email, notifications, external APIs
│   │   └── utils/            # Helpers, response formatter
│   ├── tests/                # API tests
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                 # React + Vite app
    ├── src/
    │   ├── api/              # Axios instance + API call functions
    │   ├── assets/           # Images, icons, fonts
    │   ├── components/       # Reusable UI components
    │   │   ├── common/       # Button, Input, Modal, Badge, etc.
    │   │   ├── layout/       # Navbar, Sidebar, Footer
    │   │   ├── auth/         # Login/Register forms
    │   │   ├── events/       # EventCard, EventList, EventFilter
    │   │   ├── dashboard/    # Student & Organizer dashboard widgets
    │   │   └── admin/        # Admin panel components
    │   ├── context/          # React Context (Auth, Notifications)
    │   ├── hooks/            # Custom hooks (useAuth, useEvents, etc.)
    │   ├── pages/            # Page-level components (routed)
    │   ├── utils/            # Date helpers, validators, constants
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/tictify.git
cd tictify
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Access the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 🗃 Database Models (Overview)

| Model | Purpose |
|-------|---------|
| `User` | Students, Organizers, Admins |
| `Opportunity` | Events, Scholarships, Competitions, Workshops |
| `Bookmark` | Student → Opportunity with notification pref |
| `OrganizerProfile` | Extended profile for verified organizers |
| `Notification` | In-app notification records |

---

## 🔐 Roles & Permissions

| Role | Capabilities |
|------|-------------|
| `student` | Browse, bookmark, track opportunities |
| `organizer` | Post & manage own opportunities (after approval) |
| `admin` | Approve organizers, moderate listings, view analytics |

---

## 📌 API Base Routes

```
/api/auth          → Register, Login, OAuth
/api/opportunities → CRUD for listings
/api/bookmarks     → Student bookmark management
/api/users         → Profile management
/api/admin         → Admin-only operations
/api/notifications → Notification system
```

---

## 🌿 Git Branching Strategy

```
main           → stable, production-ready
dev            → active development, merge PRs here
feature/*      → individual features (e.g. feature/auth, feature/event-listing)
fix/*          → bug fixes
```

---

## 📋 Development Status

- [x] Project structure setup
- [ ] Backend: Auth (JWT + Google OAuth)
- [ ] Backend: Opportunity CRUD
- [ ] Backend: Bookmark + Notifications
- [ ] Frontend: Auth pages
- [ ] Frontend: Opportunity browsing
- [ ] Frontend: Student dashboard
- [ ] Frontend: Organizer dashboard
- [ ] Frontend: Admin panel
- [ ] Deployment
