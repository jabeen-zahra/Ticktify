<div align="center">

<!-- Logo -->
<img src="https://img.shields.io/badge/-TICTIFY-CBFF47?style=for-the-badge&logoColor=08090F&labelColor=08090F" height="40" alt="Tictify"/>

# Tictify — Student Opportunity Platform

**Pakistan's #1 platform for university students to discover hackathons, scholarships, workshops & competitions.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

<br/>

[**Live Demo**](http://localhost:5173) · [**API Docs**](#-api-reference) · [**Report Bug**](https://github.com/jabeen-zahra/Tictify/issues) · [**Request Feature**](https://github.com/jabeen-zahra/Tictify/issues)

</div>

---

## 👥 Team

| Member | Roll No | Role |
|--------|---------|------|
| Mirfaq Javaid | 23L-3061 | Full Stack |
| Jabeen Zahra  | 23L-3065 | Full Stack |

> **Web Engineering Project** — FAST-NUCES Lahore

---

## ✨ What is Tictify?

Many Pakistani university students miss important opportunities — hackathons, scholarships, workshops — because information is scattered across WhatsApp groups, Instagram pages, and university noticeboards.

**Tictify solves this** by providing a single verified, curated platform where:
- 🎓 **Students** discover and track opportunities with deadline reminders
- 🏢 **Organizers** post and manage listings with reach analytics
- 🛡️ **Admins** verify organizers and moderate listings

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework |
| **Styling** | TailwindCSS + CSS Variables | Glassmorphism design system |
| **Backend** | Node.js + Express v5 | REST API |
| **Database** | MongoDB Atlas + Mongoose | Data persistence |
| **Auth** | JWT + Cookie-based sessions | Authentication |
| **Notifications** | Nodemailer | Email reminders |
| **Fonts** | Bricolage Grotesque + DM Sans | Typography |

---

## 📁 Project Structure

```
tictify/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, constants
│   │   ├── controllers/        # auth, admin, organizer, student, opportunity
│   │   ├── middleware/         # JWT auth, role guard, error handler
│   │   ├── models/             # User, Opportunity, Bookmark, Notification
│   │   ├── routes/             # Express routers per feature
│   │   ├── services/           # Email service
│   │   └── utils/              # Response helpers
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/                # Axios instances per feature
    │   ├── components/
    │   │   ├── auth/           # AuthLayout (split panel)
    │   │   ├── common/         # StatCard, EmptyState, LoadingSpinner
    │   │   ├── landing/        # HeroSection, Features, HowItWorks, etc.
    │   │   └── layout/         # Navbar, PageLayout
    │   ├── context/            # AuthContext (JWT + user state)
    │   ├── pages/              # LandingPage, Login, Register, Dashboards
    │   ├── styles/             # animations.css
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm

### 1. Clone

```bash
git clone https://github.com/jabeen-zahra/Tictify.git
cd Tictify
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/tictify
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
# ✅ Server: http://localhost:5000
# ✅ MongoDB connected
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev
# ✅ App: http://localhost:5173
```

### 4. Create Admin Account

Register normally → go to MongoDB Atlas → find your user document → change `role` from `"student"` to `"admin"` → log back in → access `/admin`.

---

## 🔐 Roles & Permissions

| Role | Can Do |
|------|--------|
| `student` | Browse opportunities, bookmark, track applications, get deadline reminders |
| `organizer` | Post listings (after approval), manage own listings, view analytics |
| `admin` | Approve/reject organizers, moderate all listings, manage users, feature listings |

---

## 📌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register student or organizer |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET`  | `/api/auth/me` | Private | Get current user |
| `POST` | `/api/auth/logout` | Private | Clear session |

### Opportunities
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/opportunities` | Public | Browse with filters + pagination |
| `GET`  | `/api/opportunities/featured` | Public | Featured listings |
| `GET`  | `/api/opportunities/:id` | Public | Single opportunity detail |
| `POST` | `/api/opportunities` | Organizer | Create listing |
| `PUT`  | `/api/opportunities/:id` | Organizer/Admin | Update listing |
| `DELETE` | `/api/opportunities/:id` | Organizer/Admin | Soft archive |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/admin/stats` | Admin | Platform statistics |
| `GET`  | `/api/admin/users` | Admin | All users with search/filter |
| `PATCH`| `/api/admin/users/:id/toggle-active` | Admin | Ban/activate user |
| `GET`  | `/api/admin/organizers/pending` | Admin | Pending organizer applications |
| `PATCH`| `/api/admin/organizers/:id/review` | Admin | Approve/reject organizer |
| `PATCH`| `/api/admin/listings/:id/review` | Admin | Approve/reject listing |
| `PATCH`| `/api/admin/listings/:id/feature` | Admin | Toggle featured |

### Organizer
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/organizer/stats` | Organizer | Own listing analytics |
| `GET`  | `/api/organizer/listings` | Organizer | Own listings with filters |
| `POST` | `/api/organizer/listings` | Organizer | Create listing |
| `PUT`  | `/api/organizer/listings/:id` | Organizer | Update own listing |
| `DELETE` | `/api/organizer/listings/:id` | Organizer | Archive own listing |

### Bookmarks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/bookmarks` | Student | All bookmarks |
| `POST` | `/api/bookmarks/:id` | Student | Add bookmark |
| `DELETE` | `/api/bookmarks/:id` | Student | Remove bookmark |
| `PATCH` | `/api/bookmarks/:id` | Student | Update status/notes |

---

## 🗃️ Database Models

### User
```
name, email, password (hashed), role (student/organizer/admin)
university, degreeLevel, avatar
organizerProfile: { organizationName, emailDomain, status, verifiedAt }
isActive, lastLogin, googleId
```

### Opportunity
```
title, slug, description, shortDescription
type (competition/scholarship/workshop/event)
category, tags, deadline, eventDate
isOnline, city, venue, degreeLevel[]
registrationLink, websiteLink, bannerImage
organizer (ref: User), prize
isFeatured, status, viewCount, bookmarkCount
```

### Bookmark
```
user (ref: User), opportunity (ref: Opportunity)
applicationStatus (saved/applied/accepted/rejected)
emailReminder, reminderSent, notes
```

### Notification
```
user (ref: User), type, title, message, link
isRead, refModel, refId
```

---

## 🌿 Git Branching Strategy

```
main        →  stable, production-ready code
dev         →  active development (merge PRs here)
feature/*   →  new features  (e.g. feature/student-dashboard)
fix/*       →  bug fixes     (e.g. fix/auth-token-expiry)
```

---

## 📋 Development Status

| Feature | Backend | Frontend |
|---------|---------|----------|
| Auth (Register/Login/JWT) | ✅ | ✅ |
| Landing Page | — | ✅ |
| Opportunities Browse | ✅ | ✅ |
| Bookmark System | ✅ | ✅ |
| Admin Dashboard | ✅ | ✅ |
| Organizer Dashboard | ✅ | ✅ |
| Student Dashboard | ✅ | 🔄 In Progress |
| Email Notifications | 🔄 | — |
| Google OAuth | 🔜 | 🔜 |
| Deployment | 🔜 | 🔜 |

---

## 🎨 Design System

- **Theme**: Dark (`#08090F`) with Electric Lime (`#CBFF47`) accent
- **Style**: Glassmorphism — `backdrop-filter: blur`, transparent cards, neon glows
- **Fonts**: `Bricolage Grotesque` (headings) + `DM Sans` (body)
- **Responsive**: Mobile-first, breakpoints at `sm/md/lg/xl`

---

<div align="center">

**Built with ❤️ at FAST-NUCES Lahore**

*Tictify — Find your next big opportunity.*

</div>
