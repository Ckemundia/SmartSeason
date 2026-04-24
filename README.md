# SmartSeason Field Monitoring System

A full-stack, operational field workflow platform designed to track crop progression across various lifecycle stages dynamically. The application is scaffolded safely as a unified Monorepo bridging a Vite-React UI securely to an Express API manipulating a persistent Supabase Postgres environment.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js**: `v18+` (For global fetch support)
- **Supabase**: A Free Tier project from [Supabase.com](https://supabase.com)

### 2. Database Initialization
This project uses raw Postgres tables driven seamlessly via the Supabase Javascript Client SDK.
1. Open your Supabase Dashboard.
2. Navigate to the **SQL Editor** tab.
3. Completely copy and paste the contents of `schema.sql` located inside the root of this repository.
4. Click **Run**. This establishes your relational mapping out of the box and seamlessly injects your first Super Admin automatically!

### 3. Backend Setup
1. Open your terminal natively to the Backend API:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file directly under the `backend/` directory providing the following connections securely:
   ```env
   PORT=5000
   JWT_SECRET="YOUR_CUSTOM_SECRET"
   SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGci...YOUR_SERVICE_ROLE_KEY"
   ```
3. Boot the environment natively:
   ```bash
   npm run dev
   ```

### 4. Frontend Setup
1. In a separate terminal window, open the Frontend:
   ```bash
   cd frontend
   npm install
   ```
2. By default, it hits `http://localhost:5000/api`. If deploying remotely, utilize standard environment configuration:
   ```bash
   VITE_API_URL="https://YOUR_BACKEND_URL" 
   ```
3. Execute the browser payload natively:
   ```bash
   npm run dev
   ```

### 5. Accessing the System
Navigate to `http://localhost:5173`. 
The raw initialization parameters automatically construct a default Admin Account via the SQL queries you ran:
* **Admin Email:** `admin@smartseason.com`
* **Admin Password:** `admin123`

---

## 🏗️ Design Decisions

1. **Architecture & Persistence (Supabase + API Bridging)**
   To resolve the notoriously disruptive local compilation constraints of engines like Prisma on Windows devices safely, the entire backend routes solely process directly via `@supabase/supabase-js` mapping `.select()` and `.insert()` requests. This maintains a decoupled backend purely constructed within Javascript flawlessly compatible out-of-the-box natively with Vercel's volatile serverless cycles constraints.

2. **Stage Progression & Verification Workflows**
   Rather than allowing field agents to blindly modify the native fields securely, Stage Progression natively initiates a **"Proof" Request pipeline** alongside Observation Notes and Base64 File Image Encoding. Agents submit progress, shifting the request immediately to the Admin's "Stage Requests" tab dynamically to ensure verification protocols strictly remain intact.

3. **Status Automation Engine (`Computed Status`)**
   We removed manual status properties natively out of the core data modeling inside Postgres entirely. Instead, Field structures autonomously classify their global Risk tolerance (`Active`, `At Risk`, `Completed`) dynamically upon fetched queries relying upon automated conditions (e.g. being inside the 'Planted' stage longer than 14 days, or encountering specific warning strings injected inside observational notes).

4. **Multi-Agent Capabilities & Visual Flow**
   Fields map assignment capabilities to standard PostgreSQL `INTEGER[]` structures securely allocating multi-agent deployments effortlessly to fields. To improve readability, dense HTML Tables have been entirely shifted into a scalable Trello-Style Card Grid user-interface powered entirely by modern Flexbox rendering standards natively utilizing vanilla CSS parameters.

---

## 🔒 Assumptions Made

1. **Agent Modification Boundaries:** It was assumed that standard assigned Field Agents strictly remain incapable of destructing basic operational field contexts (e.g., rewriting the Crop Type, or rewriting historical assignment constraints). Agents operate entirely via modifying operational statuses smoothly via Stage APIs and note insertions.
2. **Account Validation Checks:** Built under the assumption that organizational stability matters, any user explicitly initiating a local account via Registration immediately enters into a disabled `PENDING` cache loop natively blocking token generations. Only a validated Super Admin is permitted to approve user tokens into `ACTIVE` environments.
3. **Deployment Hosting Targets:** Recognizing standard Monorepo hosting tendencies (Vercel Node Environments), the `vercel.json` bindings seamlessly deploy routing logic separating static distribution proxies alongside backend serverless functions transparently supporting public endpoints cleanly seamlessly out of the box.
