# SmartSeason – Field Monitoring System

A full-stack field workflow platform for tracking crop progression across lifecycle stages. Built as a monorepo with a Vite + React frontend and an Express + Supabase backend.

**Live Demo:** https://smart-season-13w5.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (via `jsonwebtoken`) |
| Deployment | Vercel (frontend + serverless backend) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js `v18+`
- A free [Supabase](https://supabase.com) project

### 1. Database Setup
1. Open your Supabase project dashboard
2. Go to the **SQL Editor** tab
3. Copy and paste the contents of `schema.sql` (located in the project root)
4. Click **Run** — this creates all tables and inserts the default admin account

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
JWT_SECRET="your_jwt_secret"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

For local development, the frontend defaults to `http://localhost:5000/api`.

For a custom backend URL, create a `.env` file inside `frontend/`:
```env
VITE_API_URL=https://your-backend-url/api
```

Start the dev server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartseason.com | admin123 |

> New user registrations require admin approval before login is permitted.

---

## 🏗️ Design Decisions

### 1. Supabase over Prisma
Prisma requires native binary compilation which causes issues on Windows and in serverless environments like Vercel. Using the `@supabase/supabase-js` SDK directly avoids this entirely and works reliably across all environments.

### 2. Stage Progression Requires Admin Approval
Field agents cannot directly change a field's stage. Instead, they submit a "Stage Request" with observation notes and an optional Base64-encoded image. The admin reviews and approves or rejects the request from a dedicated tab. This enforces accountability and prevents unauthorized progression.

### 3. Computed Field Status (No Manual Status Field)
Field status (`Active`, `At Risk`, `Completed`) is not stored in the database. It is computed dynamically at query time based on rules — for example, a field stuck in the `Planted` stage for more than 14 days is flagged as `At Risk`. This removes the risk of stale or inconsistent status data.

### 4. Multi-Agent Field Assignment
Fields support multiple assigned agents via a PostgreSQL `INTEGER[]` column. This allows flexible team assignments without a separate join table.

### 5. Card-Based UI over Tables
Dense data tables were replaced with a Trello-style card grid layout using Flexbox. This improves readability especially when managing many fields simultaneously.

---

## 🔒 Assumptions

1. **Agent permissions are restricted** — Agents cannot modify core field data (crop type, historical assignments). They interact with fields only through stage requests and observation notes.
2. **New registrations are pending by default** — Registered users cannot log in until an admin activates their account. This prevents unauthorized access in a multi-tenant environment.
3. **Single admin account** — The system is initialized with one super admin via the SQL seed. Additional admins must be promoted manually via Supabase.

---

## 📁 Project Structure

```
SmartSeason/
├── frontend/         # Vite + React app
├── backend/          # Express API
│   └── src/
│       ├── routes/   # Auth, fields, users, notes, stageRequests
│       ├── middleware/
│       └── index.js
├── schema.sql        # Database schema + seed data
└── vercel.json       # Monorepo deployment config
```