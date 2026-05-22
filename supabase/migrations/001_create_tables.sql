-- ============================================================
-- Migration 001: Create Core Tables
-- ============================================================

-- flights table
CREATE TABLE IF NOT EXISTS public.flights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no     TEXT NOT NULL UNIQUE,
  origin        TEXT NOT NULL,
  destination   TEXT NOT NULL,
  departs_at    TIMESTAMPTZ NOT NULL,
  arrives_at    TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT NOT NULL DEFAULT 'Boeing 737',
  status        TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','boarding','departed','arrived','cancelled','delayed')),
  base_price    NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- seats table
CREATE TABLE IF NOT EXISTS public.seats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id     UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  seat_number   TEXT NOT NULL,
  class         TEXT NOT NULL CHECK (class IN ('economy','business','first')),
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  extra_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE (flight_id, seat_number)
);

-- bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id   UUID NOT NULL REFERENCES public.flights(id),
  seat_id     UUID NOT NULL REFERENCES public.seats(id),
  status      TEXT NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed','rescheduled','cancelled')),
  booked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_price NUMERIC(10,2) NOT NULL,
  pnr_code    TEXT NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 6))
);

-- passengers table
CREATE TABLE IF NOT EXISTS public.passengers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  passport_no  TEXT NOT NULL,
  nationality  TEXT NOT NULL,
  dob          DATE NOT NULL
);

-- reschedules table
CREATE TABLE IF NOT EXISTS public.reschedules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_flight_id  UUID NOT NULL REFERENCES public.flights(id),
  new_flight_id  UUID NOT NULL REFERENCES public.flights(id),
  requested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fee_charged    NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- indexes for performance
CREATE INDEX IF NOT EXISTS idx_flights_origin_dest_departs ON public.flights(origin, destination, departs_at);
CREATE INDEX IF NOT EXISTS idx_seats_flight_id ON public.seats(flight_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON public.bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON public.passengers(booking_id);
