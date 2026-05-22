# ✈️ SkyRoute — Flight Management PWA

A production-grade Flight Management web application built with Next.js 14, Supabase, Zustand, and Tailwind CSS.

## 🚀 Live Demo

> _Deploy to Vercel and add your URL here_

---

## 🔑 Test Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | test@flightapp.com     |
| Password | TestPass123!           |

Create this user in **Supabase Dashboard → Authentication → Users → Add user**.

---

## 🛠 Local Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd skyroute-flight-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
- Go to [supabase.com](https://supabase.com) → your project → **Settings → API**
- Copy the **Project URL** and **anon public** key

### 3. Run Supabase migrations

In your Supabase project → **SQL Editor**, run the migration files in order:

```
supabase/migrations/001_create_tables.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_rpc_functions.sql
supabase/migrations/004_seed_data.sql
```

Or, if you have the Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 4. Enable Realtime

In Supabase Dashboard → **Database → Replication**, enable realtime for the **seats** table.

### 5. Create test user

Supabase Dashboard → **Authentication → Users → Add user**
- Email: `test@flightapp.com`
- Password: `TestPass123!`

### 6. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄 Database Schema

### Tables

| Table        | Purpose                                      |
|--------------|----------------------------------------------|
| `flights`    | Flight schedule, route, pricing              |
| `seats`      | Seat map per flight, availability, class     |
| `bookings`   | Booking records with PNR codes               |
| `passengers` | Passenger details attached to each booking   |
| `reschedules`| Reschedule audit log with fee tracking       |

### Key Design Decisions

**Seat locking RPC (`reserve_seat`):** Uses `SELECT ... FOR UPDATE` inside a transaction to row-lock the seat before marking it unavailable, preventing double-booking race conditions under concurrent requests.

**Atomic cancellation RPC (`cancel_booking`):** Updates both `bookings.status` and `seats.is_available` in a single transaction — no partial states possible.

**2-hour cancellation enforcement:** Implemented at two levels:
1. Application layer: UI checks and warns user before calling RPC
2. Database layer: A `BEFORE UPDATE` trigger on `bookings` raises an exception if `status = 'cancelled'` is set within 2 hours of departure — catches any direct DB writes that bypass the application

---

## 🧠 Zustand Store Architecture

### `useFlightStore` (booking flow)

```
State:
├── searchQuery        → persisted (resume searches after tab close)
├── selectedFlight     → persisted (resume in-progress booking)
├── selectedSeat       → persisted
├── bookingStep        → persisted ('search' | 'results' | 'seat-selection' | ...)
├── passengerForm      → PARTIALLY persisted (see below)
└── optimisticSeatId   → NOT persisted (ephemeral UI state)

partialize config:
  passengerForm.passportNo → ALWAYS EXCLUDED from localStorage
  (fullName, nationality, dob are saved for convenience)
```

**Optimistic seat selection:** When a user taps a seat, it's immediately marked `selected` in the store (optimistic update) before the Supabase write confirms. If the write fails (seat taken), the UI reverts. This makes the UI feel instant.

**Reset action:** `resetBookingFlow()` clears all transient booking state on cancellation or logout, preventing stale data from leaking between sessions.

### `useUserStore` (auth & bookings)

```
State:
├── session        → persisted (session token only, for auto-login)
├── user           → persisted
└── cachedBookings → NOT persisted (fetched fresh, updated optimistically)

partialize config:
  cachedBookings → EXCLUDED (privacy + staleness concerns)
```

---

## 🛫 Seeded Flights (4 Routes, 8 Flights)

| Route                        | Flights        | Price range       |
|------------------------------|----------------|-------------------|
| Delhi → Mumbai               | SA101, SA102   | ₹3,500 – ₹4,200  |
| Mumbai → Bangalore           | SA201, SA202   | ₹2,800 – ₹3,100  |
| Bangalore → Chennai          | SA301, SA302   | ₹1,800 – ₹2,200  |
| Hyderabad → Kolkata          | SA401, SA402   | ₹4,800 – ₹5,200  |

Each flight has a 30-row × 6-column seat map (180 seats):
- **Rows 1–3:** First Class (+₹5,000)
- **Rows 4–8:** Business Class (+₹2,000)
- **Rows 9–30:** Economy (Window +₹300, Middle/Aisle free)
- ~20% of economy seats are pre-occupied for demo realism

---

## 📱 PWA Features

- **Installable** with `manifest.json` (192×192 and 512×512 icons)
- **Offline fallback page** at `/offline`
- **Cache strategies:**
  - `CacheFirst` → static assets (JS, CSS, fonts, images)
  - `StaleWhileRevalidate` → flight search results
  - `NetworkFirst` (5s timeout) → bookings (readable offline from cache)
- **Install prompt banner** shown to first-time mobile visitors

> 📸 _Add Lighthouse PWA screenshot here after deployment_

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── (auth)/login/       # Sign in page
│   ├── (auth)/signup/      # Sign up page
│   ├── search/             # Flight results (Server Component)
│   ├── booking/
│   │   ├── seat-selection/ # Interactive seat map
│   │   ├── passenger-details/
│   │   └── confirmation/   # PNR + boarding pass UI
│   ├── bookings/           # My Bookings with cancel/reschedule
│   └── offline/            # PWA offline fallback
├── components/
│   ├── flight/             # FlightResultsClient
│   ├── seat/               # SeatMapClient (Realtime)
│   ├── booking/            # PassengerFormClient, BookingsClient
│   └── layout/             # PWAInstallBanner
├── lib/
│   ├── supabase/           # server.ts, client.ts, middleware.ts
│   ├── store/              # useFlightStore, useUserStore
│   ├── types/              # database.ts (full type coverage)
│   └── utils/              # formatters, helpers
supabase/
└── migrations/             # 001–004 SQL files
```

---

## 🔒 Security Notes

- Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed to the browser — this is by design
- RLS policies ensure users can only read/write their own bookings
- Passport numbers are never written to `localStorage` (Zustand `partialize`)
- All write operations go through Security Definer RPCs — no direct table writes for critical paths

---

## ⚠️ Known Trade-offs / What I'd Improve

- **Icon generation:** The `/public/icons/` directory needs real 192×192 and 512×512 PNG icons generated (e.g. with `sharp` or a design tool) for full PWA installability
- **Email verification:** The seed user bypasses email confirmation; in production, proper email flows should be set up
- **Multi-passenger bookings:** The current schema supports one passenger per booking; multi-pax would require a separate booking per passenger or a refactor of the passengers table
- **Payment integration:** Total price is calculated and stored, but no payment gateway is integrated
- **Admin panel:** No flight management UI for adding/editing flights

---

## 📦 Tech Stack

| Layer           | Technology                        |
|-----------------|-----------------------------------|
| Framework       | Next.js 14 (App Router)           |
| Database        | Supabase (PostgreSQL)             |
| Auth            | Supabase Auth                     |
| Realtime        | Supabase Realtime                 |
| State           | Zustand + persist middleware      |
| Styling         | Tailwind CSS                      |
| PWA             | next-pwa                          |
| Fonts           | Sora + JetBrains Mono (Google)    |
| Icons           | Lucide React                      |
| Deployment      | Vercel                            |
