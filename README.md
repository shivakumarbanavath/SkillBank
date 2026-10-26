# SkillBank — Peer-to-Peer Campus Skill Exchange

> **Your Skills Are Worth More Than You Think.**  
> A community-driven knowledge exchange platform designed for students and young professionals, starting at NIT Calicut and scaling across higher education campuses.

---

## 🌟 Overview & Product Vision

SkillBank replaces the high cost of traditional private tutoring and courses with an **auditable, rating-weighted credit economy** paired with premium masterclasses and institutional hackathons.

### The Four Business Modules
1. **Module A: Peer-to-Peer Skill Exchange (1:1)** — Strictly credit-based knowledge exchange. Cash is prohibited for 1:1 sessions. Learners spend credits; teachers earn credits with rating-weighted bonuses.
2. **Module B: Expert-Led Masterclasses & Certifications** — Structured, multi-week cohort courses in INR with verifiable digital credentials (`/certificates/[id]`).
3. **Module C: Group Workshops & Bootcamps** — Multi-seat practical sessions with live seat capacity tracking and venue/meeting links.
4. **Module D: Campus & Institutional Collaborations** — Hackathons, tech expos, and cultural talent showcases with free student delegate registrations.

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** Next.js 15.5 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Next.js Server Actions & Route Handlers with server-side validation and authorization.
- **ORM & Database:** Prisma 5.22.0.
  - **Development:** SQLite (`prisma/dev.db`) for fast, zero-dependency local runs.
  - **Production:** PostgreSQL (`prisma/schema.postgresql.prisma`) for Neon, Supabase, Vercel Postgres, or AWS RDS.
- **Authentication:** Auth.js / NextAuth v5 with bcrypt password hashing, persistent JWT sessions, and database role authorization.
- **Validation:** Zod v4 schemas for type-safe form and server action inputs.
- **Design System:** Deep navy (`#020617`), electric blue (`#2563eb`), cyan accents (`#06b6d4`), glassmorphism cards, and responsive navigation.

---

## 🚀 Quickstart: Running Locally

### 1. Prerequisites
- Node.js 18.x, 20.x, or 24.x
- npm or pnpm

### 2. Clone and Install
```bash
git clone <repository-url>
cd skillbank
npm install
```

### 3. Initialize Database & Seed Content
```bash
# Generate Prisma Client
npx prisma generate

# Apply local SQLite migrations
npx prisma migrate dev

# Seed base users, skill listings, categories, and initial sessions
npm run db:seed

# Seed masterclasses, workshops, institutional events, and sample certificates
npm run db:seed:business
```

### 4. Run the Development or Production Server
```bash
# Run Development Server
npm run dev

# OR Build and Run Production Server locally
npm run check:types
node --max-old-space-size=4096 ./node_modules/next/dist/bin/next build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts & Seed Credentials

All seed accounts share the same password: **`Password123!`**

| Name | Role | Email | Campus / Focus | Starting Balance |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `ADMIN` | `admin@skillbank.app` | SkillBank Governance | 1,000 Credits |
| **Arjun Mehta** | `USER` | `arjun@nitc.ac.in` | NIT Calicut (Python / DSA / Full-Stack) | 45 Credits |
| **Sneha Sharma** | `USER` | `sneha@nitc.ac.in` | NIT Calicut (Photography & Lightroom) | 30 Credits |
| **Dev Krishnan** | `USER` | `dev@nitc.ac.in` | NIT Calicut (Tech Interview Prep & Public Speaking) | 25 Credits |
| **Priya Nair** | `USER` | `priya@nitc.ac.in` | NIT Calicut (Acoustic Guitar & Arduino) | 20 Credits |
| **Rahul Kumar** | `USER` | `rahul@nitc.ac.in` | NIT Calicut (UI/UX Design in Figma) | 20 Credits |

---

## 🌐 Production PostgreSQL Configuration & Deployment

SkillBank includes full schema parity between SQLite (local development) and PostgreSQL (production).

### 1. Database Provisioning (Neon / Supabase / Vercel Postgres)
1. Create a PostgreSQL project on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com).
2. Obtain your direct/pooled connection string:
   ```
   DATABASE_URL="postgresql://username:password@ep-sample-123456.us-east-2.aws.neon.tech/skillbank?sslmode=require"
   ```

### 2. Environment Variables Configuration
Create your environment variables in Vercel or your hosting dashboard using `.env.example` as a template:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-sample-123456.us-east-2.aws.neon.tech/skillbank?sslmode=require"

# Auth.js Secret (generate via: openssl rand -base64 32)
AUTH_SECRET="your-cryptographically-secure-random-32-byte-secret"
AUTH_URL="https://your-production-domain.vercel.app"
NEXTAUTH_URL="https://your-production-domain.vercel.app"

# Application URL
NEXT_PUBLIC_APP_URL="https://your-production-domain.vercel.app"
NODE_ENV="production"

# Optional Payment Gateway for Masterclasses (Razorpay India)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
```

### 3. Deploying Schema to PostgreSQL
To initialize and push the PostgreSQL schema to your live database:
```bash
# Push schema directly to PostgreSQL
npm run db:push:pg

# Or deploy formal migrations
npm run db:deploy:pg

# Generate production Prisma Client
npm run db:generate:pg

# Seed production categories and masterclasses
npm run db:seed
npm run db:seed:business
```

### 4. Deploying to Vercel
1. Push your repository to GitHub / GitLab.
2. Import the project into Vercel.
3. In **Build & Development Settings**, set the Build Command:
   ```bash
   node --max-old-space-size=4096 ./node_modules/next/dist/bin/next build
   ```
4. Set the Environment Variables listed above.
5. Click **Deploy**.

---

## 🛡️ Security, Financial Integrity & Rules

1. **Strict Non-Cash Escrow for Peer Exchanges:**
   - 1:1 sessions only transact in SkillBank Credits.
   - When a session is requested, 10 credits are reserved in an escrow hold (`CreditReservation`).
   - If declined or cancelled before scheduled time, credits are automatically released back to the learner.
2. **Double-Entry Style Ledger (`CreditTransaction`):**
   - Balances are never calculated on the client.
   - Every credit movement is recorded with an atomic transaction, balance snapshot, and idempotency key to prevent replay attacks and race conditions.
3. **Rating-Weighted Multipliers:**
   - Base Reward: 10 Credits.
   - Multipliers: 1-Star (0.5x = 5 cr), 2-Star (0.75x = 8 cr), 3-Star (1.0x = 10 cr), 4-Star (1.25x = 13 cr), 5-Star (1.5x = 15 cr).
4. **Server-Side Authorization & Anti-Tamper Controls:**
   - Administrative operations (`/admin`) query `User.role === 'ADMIN'` directly in the database, never trusting client-side tokens.
   - Self-booking, self-reviewing, and duplicate reviews are blocked with strict server validation.
   - Immutable audit logs (`AuditLog`) track every user suspension, verification approval, and report resolution.

---

## 📂 Public & Application Route Directory

| Route | Visibility | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Master landing page with product introduction, hero, and CTAs |
| `/explore` | Public | Search and browse community skills & categories |
| `/how-it-works` | Public | 6-step walkthrough and credit tokenomics explanation |
| `/pricing` | Public | Clear comparison between 100% free peer exchanges and paid courses |
| `/about`, `/safety` | Public | Campus story, safety rules for public meetups, and guidelines |
| `/terms`, `/privacy` | Public | Platform terms, anti-fraud rules, and privacy protections |
| `/community-guidelines`| Public | Community code of conduct and academic integrity standards |
| `/login`, `/register` | Public | Authentication with pre-configured one-click demo credentials |
| `/forgot-password`, `/reset-password` | Public | Self-service password recovery flow with secure tokens |
| `/dashboard` | Authenticated | User overview, real-time balance, upcoming sessions, and matches |
| `/skills`, `/skills/new`, `/skills/[id]` | Authenticated | Skill management, creation wizard, and session request modal |
| `/discover` | Authenticated | Interactive directory with filters and instant booking |
| `/matches` | Authenticated | Algorithmic mutual & one-way peer compatibility recommendations |
| `/sessions`, `/sessions/[id]` | Authenticated | Session state machine controls, completion settlement, and dispute filing |
| `/credits` | Authenticated | Transaction ledger, credit history, and escrow reservations |
| `/reviews` | Authenticated | Rating distribution, received reviews, and given reviews |
| `/messages` | Authenticated | 1:1 direct messaging between verified learners and teachers |
| `/notifications` | Authenticated | In-app alerts for session updates, reviews, and credits |
| `/verification` | Authenticated | Student ID upload for official campus badge verification |
| `/courses`, `/courses/[slug]` | Authenticated | Masterclass catalog, curriculum previews, and enrollment |
| `/certificates/[id]` | Public / Verifiable | High-fidelity digital completion certificates with verification ID |
| `/workshops` | Authenticated | Interactive group workshop bookings with live capacity tracking |
| `/events` | Authenticated | Campus hackathons, showcases, and free student pass reservations |
| `/settings` | Authenticated | Security settings, password change, and account deactivation |
| `/admin` | Admin Only | Platform statistics, user moderation, report resolutions, and audit logs |

---

## 🧪 Verified Test Results

- **TypeScript Compilation:** 0 errors (`npm run check:types`).
- **Next.js Production Build:** 40/40 routes compiled and prerendered cleanly in 16.0s.
- **Runtime Server:** Verified with HTTP 200/307 status checks on all endpoints.
- **Browser Automation:** End-to-end browser walkthrough conducted and captured across desktop and mobile viewports.

---

## 📄 License
This project is proprietary and built for the SkillBank campus initiative.
