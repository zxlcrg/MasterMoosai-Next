# MIMS Next.js

Mastermoosai Institute Management System rebuilt in Next.js 16 + Express-style API routes for Vercel deployment.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Components)
- **TypeScript**
- **PostgreSQL** via [Neon](https://neon.tech) (free tier)
- **Prisma 7** with `pg` adapter
- **NextAuth.js v5** for auth (credentials provider)
- **Tailwind CSS v4**
- **shadcn-style components**
- **Zod** for validation
- **React Hook Form** for forms
- **Sonner** for toasts
- **Vercel Blob** for file uploads

## Getting Started

### 1. Set up environment

Copy `.env.example` to `.env` and fill in:

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
AUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true
BLOB_READ_WRITE_TOKEN=""
```

Get a free Postgres database from [Neon](https://neon.tech) — it takes 30 seconds.

### 2. Install + setup database

```bash
npm install
npx prisma db push        # Create tables
npm run db:seed           # Seed admin user + demo data
```

### 3. Run dev server

```bash
npm run dev
```

Visit http://localhost:3000

**Admin login:** `admin@mims.test` / `password`

## Deployment

Connect to Vercel, add environment variables, push to GitHub. That's it.

## Project Structure

```
src/
├── app/
│   ├── (auth)/       # Login, Register
│   ├── (public)/     # Home, About, Courses, Contact
│   ├── admin/        # Admin panel (sidebar layout)
│   ├── teacher/      # Teacher panel
│   ├── student/      # Student panel
│   └── api/          # API routes (Express-style)
├── components/
│   ├── ui/           # Buttons, Inputs, Cards
│   ├── layouts/      # Sidebar, Topbar
│   └── shared/       # DataTable, Pagination, etc
├── lib/
│   ├── prisma.ts     # Prisma client singleton
│   ├── auth.ts       # NextAuth config
│   └── utils.ts      # Helpers (currency, date)
└── proxy.ts          # Auth middleware (route protection)
```

## Migration Status

This is the Next.js port of the [Laravel MIMS app](https://github.com/zxlcrg/MasterMoosai).
Currently includes:
- Auth (login/register/logout)
- Public website (home, about, courses, instructors, contact)
- Admin dashboard with stats
- Admin sidebar layout
- Database schema mirrored from Laravel project
- Seed data (admin user, teachers, students, courses, enrollments)
