# Detective Case File — Investigation Bureau

A complete, production-ready forensic case investigation web application built with a modern light-color theme, strict star-based level progression, server-authoritative scoring state machines, and a comprehensive administration bureau.

---

## Key Features & Operational Architecture

1. **Clean Light-Theme Case Dossier Design**:
   - Soft off-white backgrounds (`#f8fafc`), crisp card surfaces (`#ffffff`), hairline grey borders (`#e2e8f0`), pale sky blue accents, dark navy typography, and soft amber star medals.
   - Adheres to zero-pill metadata discipline, unboxed labels with `·` separators, and stamp aesthetics.

2. **Full Investigation Workflow**:
   - **Page 1: Home (`/`)**: Case registry, active dossiers, and how-to-play guide.
   - **Page 2: Case File Details (`/case/:id`)**: Incident briefing, physical evidence catalog, and persons of interest.
   - **Page 3: Rules & Regulations (`/case/:id/rules`)**: Mandatory 2-star progression rules, retry policy, scoring codex, and required acknowledgement checkbox.
   - **Page 4: Case Briefing (`/case/:id/briefing`)**: Deep narrative, clue inspection cards, suspect alibis, and timeline analysis.
   - **Page 5: Level Selection (`/case/:id/levels`)**: Easy, Medium, and Hard tiers with server-authoritative unlock verification and best-score preservation.
   - **Question Screen & Interrogation (`/case/:id/investigate/:level`)**: 3 questions per tier, multiple-choice options, countdown timer, evidence reference tags, and answer locking.
   - **Final Case Submission (`/case/:id/submit`)**: Early and final submission workflows, audit summaries, 1–5 star experience rating, feedback remarks, and unique reference generation (`SUB-BK7-XXXXXX`).
   - **Official Submissions Archive (`/submissions`)**: Searchable and filterable certified filings registry.

3. **Critical Level Result Button Visibility Rules (State Machine)**:
   - **Case A (0 or 1 star on Easy)**: Shows **Submit Case** (early) and **Retry Level**; hides **Next Level**.
   - **Case B (2 stars on Easy or Medium)**: Shows **Next Level**; hides **Submit Case** on intermediate screen.
   - **Case C (3 stars on Easy or Medium)**: Shows **Next Level**; hides **Submit Case** on intermediate screen.
   - **Case D (Hard level complete)**: Shows **Final Results** / **Submit Final Case** and **Retry**; hides **Next Level**.
   - **Case E (1 star in Medium)**: Shows **Submit Case** and **Retry Level**; hides **Next Level**.
   - **Case F (1 star in Hard)**: Shows **Final Results** / **Submit Final Case** and **Retry**; hides **Next Level**.
   - **Zero Ambiguity Rule**: Never shows both *Submit Case* and *Next Level* simultaneously on intermediate level result screens.

4. **Authoritative Admin Bureau (`/admin`)**:
   - Protected clearance route (`role === 'admin'`).
   - Recharts analytics (Score distribution histogram & daily submissions trend).
   - Case creator & editor with live draft/publish toggle.
   - Question editor with isolated private answer keys.
   - Submission audit table with detail modal and CSV export.
   - Player feedback review queue.

---

## Database & Security Design

- **PostgreSQL Migrations** located in `supabase/migrations/20261012_init.sql`.
- **Private Answer Keys**: Correct answer labels are stored in `private_answer_keys` and isolated via Row Level Security (RLS) so that public clients cannot inspect correct answers.
- **Atomic Scoring**: Supabase Edge Functions (`supabase/functions/validate-level/` and `supabase/functions/submit-case/`) score player inputs authoritatively on the server side.
- **Hybrid Store**: In AI Studio preview and development environments without active Supabase credentials, the app seamlessly runs an in-memory, localStorage-persisted atomic engine with identical security validation.

---

## 9-Step Production Deployment Guide

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public API key** from Project Settings > API.

### Step 2: Apply Database Migrations
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy the entire contents of `supabase/migrations/20261012_init.sql`.
3. Click **Run** to provision all tables, enums, RLS policies, and admin functions.

### Step 3: Configure Storage & Buckets (Optional for banner uploads)
1. Go to Storage in Supabase.
2. Create a public bucket named `case-assets` with public read access.

### Step 4: Configure Supabase Auth
1. Go to Authentication > Providers > Email.
2. Ensure Email signup is enabled.
3. Under URL Configuration, set Site URL to your production domain (e.g. `https://your-app.vercel.app`).

### Step 5: Deploy Supabase Edge Functions
Using the Supabase CLI:
```bash
supabase functions deploy validate-level
supabase functions deploy submit-case
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Step 6: Import Repository into Vercel
1. Push your repository to GitHub.
2. In Vercel, click **Add New > Project** and import the repository.
3. Framework preset: **Vite**.

### Step 7: Set Environment Variables in Vercel
Under Settings > Environment Variables, configure:
- `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `your-anon-publishable-key`

### Step 8: Deploy
Click **Deploy**. Vercel will build the frontend using Vite and host the static SPA with `vercel.json` rewrite routing rules.

### Step 9: Verify Live Application
1. Open the deployed Vercel domain.
2. Test investigator login and start the Blackwood Ruby case.
3. Test 1-star result on Easy -> verify only *Submit Case* and *Retry Level* are visible.
4. Test 2-star or 3-star result -> verify only *Next Level* is visible.
5. Complete all tiers -> file final submission and verify unique reference code generation.
6. Open `/admin` using Chief Inspector credentials and verify analytics charts, submission inspection, and CSV export.
