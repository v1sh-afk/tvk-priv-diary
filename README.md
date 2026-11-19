# TVK — Private Two-User Arcade Diary

A private digital space for exactly two people. A monochrome "secret gateway"
login screen opens into a colourful, nostalgic, pixel-arcade world containing
a shared calendar (the memory grid), a digital diary, and a sticky-note
pinboard — all synced in real time between the two users.

---

## A. Application Overview

TVK is a private two-user digital diary with a retro-arcade aesthetic. Before
login, visitors see an anonymous monochrome terminal. After login, they enter
a colourful pixel-arcade world with a time-based sky (morning, afternoon,
evening, night), a shared monthly calendar, a diary, and a sticky-note board.

Only two usernames are accepted: `herman` (display identity **V**) and
`hisgirl` (display identity **T**). No public registration exists.

---

## B. Technology Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | React 18 + TypeScript + Vite                    |
| Styling      | Tailwind CSS + custom CSS (CRT, particles)      |
| Animation    | Framer Motion                                   |
| Icons        | Lucide React                                    |
| Fonts        | Press Start 2P (arcade), Inter (body)           |
| Backend      | Supabase (Auth + PostgreSQL + Realtime + RLS)   |
| Hosting      | Firebase Hosting (static SPA)                   |
| Source control | GitHub (private repository)                   |

---

## C. Required Software Installations

```bash
# Node.js 18+ and npm
node --version   # must be >= 18

# Firebase CLI (for hosting deployment)
npm install -g firebase-tools

# Supabase CLI is NOT required — the database is already provisioned.
# You manage auth users and view data through the Supabase dashboard.
```

---

## D. Local Development Instructions

```bash
# 1. Clone the repository
git clone <your-private-repo-url> tvk
cd tvk

# 2. Install dependencies
npm install

# 3. Create your .env file (see section E)
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start the dev server
npm run dev

# 5. Open the local URL shown in the terminal (usually http://localhost:5173)
```

---

## E. Environment Variable Setup

The frontend needs two Supabase values. Copy `.env.example` to `.env` and
fill in the values from your Supabase dashboard (Settings → API):

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> The anon key is safe to expose in frontend code — it only works alongside
> Row Level Security policies. **Never** put `SUPABASE_SERVICE_ROLE_KEY` in
> `.env` or anywhere in the frontend. That key bypasses RLS.

> If you deploy through Bolt, it injects these automatically. For Firebase
> Hosting, you must set them in `.env` before running `npm run build`.

---

## F. Supabase Configuration

### Project URL and anon key

Find these in your Supabase dashboard → **Settings → API**:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Database schema

Three tables (all with RLS enabled):

**`allowed_users`** — the two-user allowlist
| Column             | Type    | Notes                          |
| ------------------ | ------- | ------------------------------ |
| `uid`              | uuid    | PK, references auth.users(id)  |
| `username`         | text    | unique, 'herman' or 'hisgirl'  |
| `display_identity` | text    | 'V' or 'T'                     |
| `created_at`       | timestamptz | default now()              |

**`diary_entries`** — shared diary
| Column             | Type    | Notes                          |
| ------------------ | ------- | ------------------------------ |
| `id`               | uuid    | PK, default gen_random_uuid()  |
| `title`            | text    | default ''                     |
| `content`          | text    | default ''                     |
| `entry_date`       | date    | the calendar day               |
| `author_uid`       | uuid    | references auth.users(id)      |
| `author_identity`  | text    | 'V' or 'T', immutable          |
| `created_at`       | timestamptz | default now()              |
| `updated_at`       | timestamptz | default now()              |

**`sticky_notes`** — shared pinboard
| Column             | Type    | Notes                          |
| ------------------ | ------- | ------------------------------ |
| `id`               | uuid    | PK, default gen_random_uuid()  |
| `content`          | text    | default ''                     |
| `color`            | text    | 'pink','lavender','cyan','yellow' |
| `author_uid`       | uuid    | references auth.users(id)      |
| `author_identity`  | text    | 'V' or 'T', immutable          |
| `created_at`       | timestamptz | default now()              |
| `updated_at`       | timestamptz | default now()              |

### RLS policies

All tables have RLS enabled. The `anon` role has **no grants** on any table.
Only `authenticated` users whose UID appears in `allowed_users` can read or
write. INSERT requires `author_uid = auth.uid()` (no identity spoofing).
Database triggers make `author_uid` and `author_identity` immutable on update.

### Authentication settings

1. In the Supabase dashboard, go to **Authentication → Users**.
2. Click **Add user** → enter `herman@tvk.app` and a secure password.
3. Repeat for `hisgirl@tvk.app`.
4. Copy each user's UID from the dashboard.
5. Insert them into `allowed_users`:

```sql
INSERT INTO allowed_users (uid, username, display_identity) VALUES
  ('<herman-uid>', 'herman', 'V'),
  ('<hisgirl-uid>', 'hisgirl', 'T');
```

6. Ensure **Email confirmations** are OFF (Authentication → Providers → Email).
7. Ensure no public signups are allowed (disable "Allow new users to sign up"
   if you want to be extra safe, though only the two emails matter).

### Storage configuration

TVK does not use Supabase Storage. No buckets are needed.

---

## G. Firebase Hosting Setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com).
2. Click **Add project**, name it (e.g. `tvk-app`), and create it.

### 2. Register a web application

1. In your Firebase project, click the **Web icon (`</>`)** to add an app.
2. Give it a nickname (e.g. `tvk-web`).
3. You do **not** need the Firebase SDK config — the app uses Supabase, not
   Firebase, for auth/database. Firebase is only for static hosting.
4. Skip the SDK setup screen.

### 3. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase --version   # confirm it's installed
```

### 4. Log in and select your project

```bash
firebase login
# Copy .firebaserc.example to .firebaserc and replace the project ID:
cp .firebaserc.example .firebaserc
# Edit .firebaserc: change "your-firebase-project-id" to your real project ID
```

### 5. Build the app

```bash
npm run build
# This outputs static files to dist/
```

### 6. Deploy

```bash
firebase deploy --only hosting
```

After deployment, Firebase gives you a URL like
`https://tvk-app.web.app`. Your app is live.

### 7. Environment variables on Firebase Hosting

Firebase Hosting serves static files — it does not inject environment
variables at request time. You must bake the Supabase credentials into the
build:

```bash
# Set them in .env before building
cp .env.example .env
# Edit .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run build
firebase deploy --only hosting
```

The `firebase.json` file is already configured with:
- `public`: `dist` (Vite's output directory)
- SPA rewrite: all routes → `/index.html` (so direct refreshes work)
- Cache headers for static assets

---

## H. GitHub Setup

### Connect the repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: TVK private arcade diary"

# Create a private repo on GitHub (do NOT make it public)
# Then connect it:
git remote add origin git@github.com:<your-username>/tvk.git
git branch -M main
git push -u origin main
```

### Ensure secrets are excluded

The `.gitignore` file already excludes:
- `.env` and `.env.local` (Supabase credentials)
- `.firebaserc` (project-specific Firebase config)
- `node_modules/`, `dist/`

**Never commit:**
- `.env` files containing real keys
- `SUPABASE_SERVICE_ROLE_KEY`
- Firebase service-account JSON files
- User passwords

### How to update the application

```bash
# Make changes, then:
git add .
git commit -m "Description of changes"
git push origin main

# To deploy the update:
npm run build
firebase deploy --only hosting
```

---

## I. Production Verification Checklist

| #  | Check                                        | Status |
|----| -------------------------------------------- | ------ |
| 1  | Login page is monochrome                     | Manual |
| 2  | `herman` login → WELCOME, V                  | Manual |
| 3  | `hisgirl` login → WELCOME, T                 | Manual |
| 4  | Invalid credentials rejected                 | Manual |
| 5  | Third-party Supabase account denied          | Manual |
| 6  | Logout returns to monochrome login           | Manual |
| 7  | Protected pages not accessible without login | Manual |
| 8  | Calendar month navigation works              | Manual |
| 9  | Today's date highlighted                      | Manual |
| 10 | Dates with entries highlighted                | Manual |
| 11 | Create diary entry, persists after refresh    | Manual |
| 12 | Edit diary entry, author identity preserved   | Manual |
| 13 | Delete diary entry with confirmation          | Manual |
| 14 | Create/edit/delete sticky notes               | Manual |
| 15 | Real-time sync between two sessions           | Manual |
| 16 | Four time-based environments work             | Manual |
| 17 | Mobile layout stacks correctly                | Manual |
| 18 | RLS enabled on all tables                     | Done   |
| 19 | anon role has no grants                       | Done   |
| 20 | No service-role keys in frontend              | Done   |
| 21 | Environment variables documented              | Done   |
| 22 | No private secrets committed                  | Done   |
| 23 | Production build succeeds (`npm run build`)   | Done   |
| 24 | Firebase Hosting config exists                | Done   |
| 25 | README deployment guide complete              | Done   |

"Manual" items require you to test with real Supabase auth accounts.

---

## Project Structure

```
src/
  components/
    calendar/       MemoryCalendar
    diary/          DiaryEditor
    layout/         DashboardLayout, EnvironmentBackground, ArcadeTransition
    sticky-notes/   StickyNoteBoard
    ui/             PixelCard
  contexts/         AuthContext, ThemeContext
  pages/            Login, Home, Memories, Pinboard, Settings
  services/
    firebase/       supabaseClient, identityMap
    diary/          diaryService
    sticky-notes/   stickyNoteService
  types/            shared TypeScript types
  utils/            time, drafts
```

## Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build → dist/
npm run typecheck  # TypeScript validation
npm run lint       # ESLint
```
