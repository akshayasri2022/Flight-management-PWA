-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.flights    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;

-- ── flights: public read, no writes from client ──────────────
CREATE POLICY "flights_select_all"
  ON public.flights FOR SELECT
  USING (true);

-- ── seats: public read, no direct writes from client ─────────
CREATE POLICY "seats_select_all"
  ON public.seats FOR SELECT
  USING (true);

-- ── bookings: users access only their own rows ────────────────
CREATE POLICY "bookings_select_own"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── passengers: users access only their bookings' passengers ──
CREATE POLICY "passengers_select_own"
  ON public.passengers FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own"
  ON public.passengers FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

-- ── reschedules: users access only their bookings' reschedules ─
CREATE POLICY "reschedules_select_own"
  ON public.reschedules FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own"
  ON public.reschedules FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );
