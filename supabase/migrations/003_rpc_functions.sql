-- ============================================================
-- Migration 003: RPC Functions & Triggers
-- ============================================================

-- ── Seat Reservation RPC (prevents double-booking) ───────────
-- Uses SELECT FOR UPDATE to lock the row during the transaction,
-- preventing concurrent requests from booking the same seat.
CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_user_id     UUID,
  p_flight_id   UUID,
  p_seat_id     UUID,
  p_total_price NUMERIC,
  p_pnr_code    TEXT,
  p_full_name   TEXT,
  p_passport_no TEXT,
  p_nationality TEXT,
  p_dob         DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
  v_seat_row   public.seats%ROWTYPE;
BEGIN
  -- Lock the seat row to prevent concurrent bookings
  SELECT * INTO v_seat_row
  FROM public.seats
  WHERE id = p_seat_id
    AND flight_id = p_flight_id
    AND is_available = TRUE
  FOR UPDATE;

  -- If no row found the seat is taken or doesn't exist
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Seat is no longer available'
    );
  END IF;

  -- Mark the seat as unavailable
  UPDATE public.seats
  SET is_available = FALSE
  WHERE id = p_seat_id;

  -- Create the booking
  INSERT INTO public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, p_total_price, p_pnr_code)
  RETURNING id INTO v_booking_id;

  -- Create the passenger record
  INSERT INTO public.passengers (booking_id, full_name, passport_no, nationality, dob)
  VALUES (v_booking_id, p_full_name, p_passport_no, p_nationality, p_dob);

  RETURN json_build_object(
    'success',    true,
    'booking_id', v_booking_id,
    'pnr_code',   p_pnr_code
  );
END;
$$;

-- ── Cancel Booking RPC (atomic seat release) ─────────────────
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID,
  p_user_id    UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking     public.bookings%ROWTYPE;
  v_departs_at  TIMESTAMPTZ;
BEGIN
  -- Fetch and lock the booking row
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
    AND user_id = p_user_id
    AND status = 'confirmed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Booking not found or already cancelled'
    );
  END IF;

  -- Check departure time constraint (DB-level enforcement)
  SELECT departs_at INTO v_departs_at
  FROM public.flights
  WHERE id = v_booking.flight_id;

  IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Cancellations are not allowed within 2 hours of departure'
    );
  END IF;

  -- Atomically cancel booking and free seat
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;

  UPDATE public.seats
  SET is_available = TRUE
  WHERE id = v_booking.seat_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Booking cancelled successfully'
  );
END;
$$;

-- ── Reschedule Booking RPC ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id    UUID,
  p_user_id       UUID,
  p_new_flight_id UUID,
  p_new_seat_id   UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking        public.bookings%ROWTYPE;
  v_new_seat       public.seats%ROWTYPE;
  v_new_flight     public.flights%ROWTYPE;
  v_old_flight     public.flights%ROWTYPE;
  v_fee_charged    NUMERIC := 0;
  v_new_total      NUMERIC;
BEGIN
  -- Lock current booking
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
    AND user_id = p_user_id
    AND status IN ('confirmed', 'rescheduled')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  -- Lock new seat
  SELECT * INTO v_new_seat
  FROM public.seats
  WHERE id = p_new_seat_id
    AND flight_id = p_new_flight_id
    AND is_available = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'New seat is not available');
  END IF;

  SELECT * INTO v_old_flight FROM public.flights WHERE id = v_booking.flight_id;
  SELECT * INTO v_new_flight FROM public.flights WHERE id = p_new_flight_id;

  -- Charge a fee if new flight is more expensive
  v_new_total := v_new_flight.base_price + v_new_seat.extra_fee;
  IF v_new_total > v_booking.total_price THEN
    v_fee_charged := v_new_total - v_booking.total_price;
  END IF;

  -- Free old seat
  UPDATE public.seats SET is_available = TRUE WHERE id = v_booking.seat_id;

  -- Occupy new seat
  UPDATE public.seats SET is_available = FALSE WHERE id = p_new_seat_id;

  -- Log reschedule
  INSERT INTO public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_booking.flight_id, p_new_flight_id, v_fee_charged);

  -- Update booking
  UPDATE public.bookings
  SET
    flight_id   = p_new_flight_id,
    seat_id     = p_new_seat_id,
    status      = 'rescheduled',
    total_price = v_new_total
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success',     true,
    'fee_charged', v_fee_charged,
    'new_total',   v_new_total
  );
END;
$$;

-- ── DB-Level Cancellation Constraint Trigger ─────────────────
-- Belt-and-suspenders enforcement beyond the RPC check.
CREATE OR REPLACE FUNCTION public.check_cancellation_window()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  -- Only enforce when transitioning to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs_at
    FROM public.flights
    WHERE id = NEW.flight_id;

    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION
        'Cannot cancel booking within 2 hours of departure (departs at %)', v_departs_at
        USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_cancellation_window
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cancellation_window();

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.reserve_seat    TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking  TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_booking TO authenticated;
