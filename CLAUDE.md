# 7-dashboard

## Overview

7YR annual goals and progress management dashboard web app. Visualizes goal progress, KPIs, timelines, and tasks in a Jira-style interface.

**Access URL:** `http://localhost/dashboard/`
**Jira Project:** PLAN (`https://7yr.atlassian.net/jira/software/projects/PLAN/board`)
**Repository:** `7yrde/7-dashboard` (previously `qkrwogk/7-dashboard`)
**Submodule path in 7YR super-project:** `./7-dashboard`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.4.5 (App Router) |
| Language | TypeScript 5.x (strict mode) |
| Runtime | React 19.1.0 |
| Database | better-sqlite3 12.2.0 (SQLite, native module) |
| Auth | next-auth 4.24.11 (credentials provider, JWT) |
| Styles | Tailwind CSS 4.x + CSS variables |
| Icons | Lucide React |
| Markdown | react-markdown |
| Dev | Turbopack, ESLint 9.x |

---

## Repository Structure

```
src/
├── app/
│   ├── api/                    # API routes (Next.js App Router)
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── categories/         # Category read endpoints
│   │   ├── goals/              # Goal CRUD + comments + attachments
│   │   ├── tasks/              # Task CRUD
│   │   ├── comments/           # Comment likes
│   │   └── attachments/        # File download
│   ├── auth/signin/            # Public login page
│   ├── category/[slug]/        # Category detail page (SSR auth check)
│   ├── goal/[slug]/            # Goal detail page (SSR auth check)
│   ├── issues/                 # Integrated issues view (Jira-style)
│   ├── layout.tsx              # Root layout with SessionProvider
│   ├── page.tsx                # Dashboard home (SSR auth check)
│   └── globals.css             # CSS variables + Tailwind base
├── components/                 # React client components
├── lib/
│   ├── database.ts             # DB singleton + schema + seed
│   └── init-db.ts              # CLI script to initialize database
└── types/                      # TypeScript type definitions
```

**Runtime data (gitignored):**
- `./data/dashboard.db` — SQLite database file
- `./uploads/{goalId}/{timestamp}-{filename}` — uploaded attachments

---

## Database Schema

Tables use snake_case fields and integer primary keys.

```sql
users        (id, username, password, created_at)
categories   (id, name, slug, color, icon, created_at)
goals        (id, category_id, year, slug, title, description, content,
              status, priority, start_date, target_date, created_at, updated_at)
tasks        (id, goal_id, title, description, status, priority,
              created_at, completed_at)
comments     (id, goal_id, user_id, content, likes, created_at, updated_at)
attachments  (id, goal_id, filename, original_name, file_size,
              mime_type, file_path, created_at)
```

**Enums:**
- `status`: `open` | `in_progress` | `resolved` | `closed`
- `priority`: `low` | `medium` | `high` | `critical`

**Fixed categories (seeded on init):** 컴퓨터 (`computer`), 음악 (`music`), 건강 (`health`), 돈 (`money`), 언어 (`language`)

**Slug format for goals:** `{category-slug}-{goal-id}` (e.g., `computer-1`)

---

## API Routes

All responses use `NextResponse.json()`. Protected routes check `getServerSession()`.

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/categories` | List all categories | — |
| GET | `/api/categories/[slug]` | Get category by slug | — |
| GET | `/api/goals?year=&category=` | List goals with filters | — |
| POST | `/api/goals` | Create goal | required |
| GET | `/api/goals/[slug]` | Get goal details | — |
| PATCH | `/api/goals/[slug]` | Update goal | required |
| GET | `/api/goals/[slug]/comments` | List comments | — |
| POST | `/api/goals/[slug]/comments` | Add comment | required |
| POST | `/api/comments/[id]/like` | Increment likes | — |
| GET | `/api/goals/[slug]/attachments` | List attachments | — |
| POST | `/api/goals/[slug]/attachments` | Upload file (multipart) | required |
| GET | `/api/attachments/[id]` | Download attachment | — |
| GET | `/api/tasks?goalId=` | List tasks | — |
| POST | `/api/tasks` | Create task | required |
| PATCH | `/api/tasks/[id]` | Update task | required |
| DELETE | `/api/tasks/[id]` | Delete task | required |

---

## Key Pages & Components

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Dashboard.tsx` | Category cards + year selector; requires auth |
| `/auth/signin` | (inline) | Login form; public |
| `/category/[slug]` | `CategoryDetail.tsx` | Goals list with progress bars |
| `/goal/[slug]` | `GoalDetail.tsx` | Markdown editor, tasks, comments, files |
| `/issues` | `IssuesView.tsx` | Split sidebar + detail panel (Jira-style) |

**Other components:** `AddGoalModal.tsx`, `CategoryCard.tsx`, `Navigation.tsx`, `SessionProvider.tsx`, `ThemeToggle.tsx`, `YearSelector.tsx`

---

## Conventions

### Code Style
- **Components:** PascalCase files and function names (`GoalDetail.tsx`)
- **Utilities/lib:** camelCase files (`database.ts`)
- **DB fields:** snake_case (`category_id`, `start_date`)
- **URL slugs:** kebab-case (`computer-1`, `music-2`)
- **State/variables:** camelCase
- **CSS variables:** `--kebab-case` prefixed with `--`

### Data Fetching
- Server pages: `getServerSession()` for auth check, redirect to `/auth/signin` if unauthenticated
- Client components: vanilla `fetch()` in `useEffect()` — no external fetching library
- Database: direct parameterized SQL via `better-sqlite3` prepared statements (`.prepare().run()`)
- Single DB instance via `getDatabase()` singleton in `src/lib/database.ts`

### Authentication
- Credentials provider (username/password) against `users` table
- JWT session strategy — session contains `user.id`, `user.name`, `user.email`
- Protected API routes return `401` if session missing

### Error Handling
- API routes: `try/catch` with `NextResponse.json({ error }, { status: 5xx })`
- Client: `console.error` + Korean-language user-facing messages
- No custom error boundary components currently

### TypeScript
- `@/*` path alias maps to `./src/*`
- NextAuth types extended: `Session.user.id` and `JWT.id`
- Strict mode enabled — no `any` without comment

---

## Theming

Dark/light mode via CSS variables + Tailwind `dark:` prefix.

```
Light: bg=#ffffff, fg=#171717, primary=#15803d (green), border=#e2e8f0
Dark:  bg=#0f172a, fg=#f8fafc, card=#1e293b, border=#334155
```

Toggle stored in `localStorage` key `theme`; fallback to `prefers-color-scheme`. Applied via `document.documentElement.classList.toggle('dark')`.

---

## Development

```bash
# Install dependencies
npm install

# Initialize database (required on first run)
npx tsx src/lib/init-db.ts

# Start dev server (Turbopack)
npm run dev
# → http://localhost:3000/dashboard/

# Production build
npm run build
npm start

# Lint
npm run lint
```

**Default test account:** `tester` / `secretweapon` (created by init-db script)

---

## Docker Deployment

Multi-stage build:
1. **Builder** (`node:22-alpine`): installs `python3 make g++` for native better-sqlite3 compilation, then builds Next.js
2. **Runner** (`node:22-alpine`): copies standalone output, runs as non-root `nextjs` user on port 3000

**Required Next.js config:**
- `output: "standalone"` — self-contained build
- `basePath: "/dashboard"` — served under `/dashboard` subpath

**Nginx** proxies `/dashboard/` → `localhost:3000`

**Persist volumes:**
- `./data/` — SQLite database
- `./uploads/` — file attachments

---

## Known TODOs (from README)

- Add "New Goal" button to issues page sidebar
- Fix sidebar scroll errors on issues page
- Dashboard real-time updates when goals are added
- User settings/preferences feature
- Sidebar navigation for dashboard
- Test coverage
