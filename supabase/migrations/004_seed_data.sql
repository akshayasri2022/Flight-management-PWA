-- ============================================================
-- COMPLETE RESEED: Many routes, smart dates
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. Clean existing data (order matters due to foreign keys)
DELETE FROM public.reschedules;
DELETE FROM public.passengers;
DELETE FROM public.bookings;
DELETE FROM public.seats;
DELETE FROM public.flights;

-- 2. Insert flights across MANY routes
--    dates use NOW() + random future intervals so any date works
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES

-- ── Delhi routes ──────────────────────────────────────────────
('SA101', 'Delhi', 'Mumbai',       NOW() + INTERVAL '1 day 6 hours',   NOW() + INTERVAL '1 day 8 hours',         'Airbus A320', 'scheduled', 3500),
('SA102', 'Delhi', 'Mumbai',       NOW() + INTERVAL '3 day 14 hours',  NOW() + INTERVAL '3 day 16 hours',        'Boeing 737',  'scheduled', 4200),
('SA103', 'Delhi', 'Mumbai',       NOW() + INTERVAL '5 day 9 hours',   NOW() + INTERVAL '5 day 11 hours',        'Airbus A321', 'scheduled', 3800),

('SA111', 'Delhi', 'Bangalore',    NOW() + INTERVAL '2 day 7 hours',   NOW() + INTERVAL '2 day 9 hours 40 minutes', 'Boeing 737', 'scheduled', 4500),
('SA112', 'Delhi', 'Bangalore',    NOW() + INTERVAL '4 day 16 hours',  NOW() + INTERVAL '4 day 18 hours 40 minutes','Airbus A320','scheduled', 5000),

('SA121', 'Delhi', 'Chennai',      NOW() + INTERVAL '1 day 10 hours',  NOW() + INTERVAL '1 day 12 hours 45 minutes','Airbus A321','scheduled', 5200),
('SA122', 'Delhi', 'Chennai',      NOW() + INTERVAL '6 day 8 hours',   NOW() + INTERVAL '6 day 10 hours 45 minutes','Boeing 737', 'scheduled', 4800),

('SA131', 'Delhi', 'Hyderabad',    NOW() + INTERVAL '2 day 11 hours',  NOW() + INTERVAL '2 day 13 hours 10 minutes','Airbus A320','scheduled', 4100),
('SA132', 'Delhi', 'Hyderabad',    NOW() + INTERVAL '7 day 15 hours',  NOW() + INTERVAL '7 day 17 hours 10 minutes','Boeing 737', 'scheduled', 3900),

('SA141', 'Delhi', 'Kolkata',      NOW() + INTERVAL '1 day 14 hours',  NOW() + INTERVAL '1 day 16 hours 20 minutes','Airbus A320','scheduled', 4600),
('SA142', 'Delhi', 'Kolkata',      NOW() + INTERVAL '5 day 6 hours',   NOW() + INTERVAL '5 day 8 hours 20 minutes', 'Boeing 737', 'scheduled', 5000),

('SA151', 'Delhi', 'Ahmedabad',    NOW() + INTERVAL '3 day 8 hours',   NOW() + INTERVAL '3 day 9 hours 30 minutes', 'ATR 72',     'scheduled', 2800),
('SA152', 'Delhi', 'Ahmedabad',    NOW() + INTERVAL '8 day 17 hours',  NOW() + INTERVAL '8 day 18 hours 30 minutes','Airbus A320','scheduled', 3100),

('SA161', 'Delhi', 'Pune',         NOW() + INTERVAL '2 day 9 hours',   NOW() + INTERVAL '2 day 11 hours',        'Boeing 737',  'scheduled', 3700),
('SA162', 'Delhi', 'Pune',         NOW() + INTERVAL '9 day 13 hours',  NOW() + INTERVAL '9 day 15 hours',        'Airbus A320', 'scheduled', 4000),

-- ── Mumbai routes ─────────────────────────────────────────────
('SA201', 'Mumbai', 'Bangalore',   NOW() + INTERVAL '1 day 9 hours',   NOW() + INTERVAL '1 day 10 hours 30 minutes','Airbus A320','scheduled', 2800),
('SA202', 'Mumbai', 'Bangalore',   NOW() + INTERVAL '4 day 7 hours',   NOW() + INTERVAL '4 day 8 hours 30 minutes', 'Boeing 737', 'scheduled', 3100),
('SA203', 'Mumbai', 'Bangalore',   NOW() + INTERVAL '7 day 19 hours',  NOW() + INTERVAL '7 day 20 hours 30 minutes','Airbus A321','scheduled', 2600),

('SA211', 'Mumbai', 'Delhi',       NOW() + INTERVAL '2 day 6 hours',   NOW() + INTERVAL '2 day 8 hours',         'Boeing 737',  'scheduled', 3600),
('SA212', 'Mumbai', 'Delhi',       NOW() + INTERVAL '6 day 11 hours',  NOW() + INTERVAL '6 day 13 hours',        'Airbus A320', 'scheduled', 4100),

('SA221', 'Mumbai', 'Chennai',     NOW() + INTERVAL '1 day 12 hours',  NOW() + INTERVAL '1 day 14 hours',        'Airbus A320', 'scheduled', 3200),
('SA222', 'Mumbai', 'Chennai',     NOW() + INTERVAL '5 day 8 hours',   NOW() + INTERVAL '5 day 10 hours',        'Boeing 737',  'scheduled', 3500),

('SA231', 'Mumbai', 'Hyderabad',   NOW() + INTERVAL '3 day 7 hours',   NOW() + INTERVAL '3 day 8 hours 20 minutes', 'ATR 72',    'scheduled', 2400),
('SA232', 'Mumbai', 'Hyderabad',   NOW() + INTERVAL '8 day 14 hours',  NOW() + INTERVAL '8 day 15 hours 20 minutes','Airbus A320','scheduled', 2700),

('SA241', 'Mumbai', 'Kolkata',     NOW() + INTERVAL '2 day 10 hours',  NOW() + INTERVAL '2 day 12 hours 30 minutes','Boeing 737','scheduled', 4800),
('SA242', 'Mumbai', 'Kolkata',     NOW() + INTERVAL '6 day 16 hours',  NOW() + INTERVAL '6 day 18 hours 30 minutes','Airbus A321','scheduled', 5100),

('SA251', 'Mumbai', 'Pune',        NOW() + INTERVAL '1 day 7 hours',   NOW() + INTERVAL '1 day 7 hours 45 minutes', 'ATR 72',    'scheduled', 1200),
('SA252', 'Mumbai', 'Pune',        NOW() + INTERVAL '4 day 18 hours',  NOW() + INTERVAL '4 day 18 hours 45 minutes','ATR 72',    'scheduled', 1400),

('SA261', 'Mumbai', 'Ahmedabad',   NOW() + INTERVAL '3 day 9 hours',   NOW() + INTERVAL '3 day 10 hours',        'Airbus A320', 'scheduled', 1800),
('SA262', 'Mumbai', 'Ahmedabad',   NOW() + INTERVAL '9 day 12 hours',  NOW() + INTERVAL '9 day 13 hours',        'Boeing 737',  'scheduled', 2000),

-- ── Bangalore routes ──────────────────────────────────────────
('SA301', 'Bangalore', 'Chennai',  NOW() + INTERVAL '1 day 11 hours',  NOW() + INTERVAL '1 day 12 hours',        'ATR 72',      'scheduled', 1800),
('SA302', 'Bangalore', 'Chennai',  NOW() + INTERVAL '5 day 16 hours',  NOW() + INTERVAL '5 day 17 hours',        'Airbus A320', 'scheduled', 2200),
('SA303', 'Bangalore', 'Chennai',  NOW() + INTERVAL '10 day 8 hours',  NOW() + INTERVAL '10 day 9 hours',        'ATR 72',      'scheduled', 1600),

('SA311', 'Bangalore', 'Mumbai',   NOW() + INTERVAL '2 day 8 hours',   NOW() + INTERVAL '2 day 9 hours 30 minutes', 'Boeing 737','scheduled', 2900),
('SA312', 'Bangalore', 'Mumbai',   NOW() + INTERVAL '7 day 13 hours',  NOW() + INTERVAL '7 day 14 hours 30 minutes','Airbus A320','scheduled', 3200),

('SA321', 'Bangalore', 'Delhi',    NOW() + INTERVAL '1 day 15 hours',  NOW() + INTERVAL '1 day 17 hours 40 minutes','Airbus A321','scheduled', 4600),
('SA322', 'Bangalore', 'Delhi',    NOW() + INTERVAL '6 day 9 hours',   NOW() + INTERVAL '6 day 11 hours 40 minutes','Boeing 737', 'scheduled', 5000),

('SA331', 'Bangalore', 'Hyderabad',NOW() + INTERVAL '2 day 14 hours',  NOW() + INTERVAL '2 day 15 hours 20 minutes','ATR 72',    'scheduled', 2000),
('SA332', 'Bangalore', 'Hyderabad',NOW() + INTERVAL '8 day 11 hours',  NOW() + INTERVAL '8 day 12 hours 20 minutes','Airbus A320','scheduled', 2300),

('SA341', 'Bangalore', 'Kolkata',  NOW() + INTERVAL '3 day 7 hours',   NOW() + INTERVAL '3 day 9 hours 30 minutes', 'Boeing 737','scheduled', 4200),
('SA342', 'Bangalore', 'Kolkata',  NOW() + INTERVAL '9 day 18 hours',  NOW() + INTERVAL '9 day 20 hours 30 minutes','Airbus A321','scheduled', 4600),

-- ── Chennai routes ────────────────────────────────────────────
('SA401', 'Chennai', 'Bangalore',  NOW() + INTERVAL '1 day 8 hours',   NOW() + INTERVAL '1 day 9 hours',         'ATR 72',      'scheduled', 1900),
('SA402', 'Chennai', 'Bangalore',  NOW() + INTERVAL '4 day 15 hours',  NOW() + INTERVAL '4 day 16 hours',        'Airbus A320', 'scheduled', 2100),

('SA411', 'Chennai', 'Mumbai',     NOW() + INTERVAL '2 day 9 hours',   NOW() + INTERVAL '2 day 11 hours',        'Boeing 737',  'scheduled', 3300),
('SA412', 'Chennai', 'Mumbai',     NOW() + INTERVAL '7 day 7 hours',   NOW() + INTERVAL '7 day 9 hours',         'Airbus A320', 'scheduled', 3600),

('SA421', 'Chennai', 'Delhi',      NOW() + INTERVAL '1 day 13 hours',  NOW() + INTERVAL '1 day 15 hours 45 minutes','Airbus A321','scheduled', 4900),
('SA422', 'Chennai', 'Delhi',      NOW() + INTERVAL '5 day 10 hours',  NOW() + INTERVAL '5 day 12 hours 45 minutes','Boeing 737', 'scheduled', 5300),

('SA431', 'Chennai', 'Hyderabad',  NOW() + INTERVAL '3 day 11 hours',  NOW() + INTERVAL '3 day 12 hours 10 minutes','ATR 72',    'scheduled', 2100),
('SA432', 'Chennai', 'Hyderabad',  NOW() + INTERVAL '8 day 9 hours',   NOW() + INTERVAL '8 day 10 hours 10 minutes','Airbus A320','scheduled', 2400),

('SA441', 'Chennai', 'Kolkata',    NOW() + INTERVAL '2 day 16 hours',  NOW() + INTERVAL '2 day 18 hours 30 minutes','Boeing 737','scheduled', 4400),
('SA442', 'Chennai', 'Kolkata',    NOW() + INTERVAL '6 day 14 hours',  NOW() + INTERVAL '6 day 16 hours 30 minutes','Airbus A321','scheduled', 4800),

-- ── Hyderabad routes ──────────────────────────────────────────
('SA501', 'Hyderabad', 'Kolkata',  NOW() + INTERVAL '3 day 8 hours',   NOW() + INTERVAL '3 day 10 hours 30 minutes','Boeing 737','scheduled', 4800),
('SA502', 'Hyderabad', 'Kolkata',  NOW() + INTERVAL '6 day 18 hours',  NOW() + INTERVAL '6 day 20 hours 30 minutes','Airbus A321','scheduled', 5200),

('SA511', 'Hyderabad', 'Delhi',    NOW() + INTERVAL '1 day 7 hours',   NOW() + INTERVAL '1 day 9 hours 10 minutes', 'Airbus A320','scheduled', 4200),
('SA512', 'Hyderabad', 'Delhi',    NOW() + INTERVAL '5 day 12 hours',  NOW() + INTERVAL '5 day 14 hours 10 minutes','Boeing 737', 'scheduled', 4600),

('SA521', 'Hyderabad', 'Mumbai',   NOW() + INTERVAL '2 day 8 hours',   NOW() + INTERVAL '2 day 9 hours 20 minutes', 'ATR 72',    'scheduled', 2500),
('SA522', 'Hyderabad', 'Mumbai',   NOW() + INTERVAL '7 day 16 hours',  NOW() + INTERVAL '7 day 17 hours 20 minutes','Airbus A320','scheduled', 2800),

('SA531', 'Hyderabad', 'Bangalore',NOW() + INTERVAL '1 day 10 hours',  NOW() + INTERVAL '1 day 11 hours 20 minutes','ATR 72',    'scheduled', 2100),
('SA532', 'Hyderabad', 'Bangalore',NOW() + INTERVAL '4 day 14 hours',  NOW() + INTERVAL '4 day 15 hours 20 minutes','Airbus A320','scheduled', 2400),

('SA541', 'Hyderabad', 'Chennai',  NOW() + INTERVAL '3 day 9 hours',   NOW() + INTERVAL '3 day 10 hours 10 minutes','ATR 72',    'scheduled', 2200),
('SA542', 'Hyderabad', 'Chennai',  NOW() + INTERVAL '9 day 7 hours',   NOW() + INTERVAL '9 day 8 hours 10 minutes', 'Airbus A320','scheduled', 2500),

-- ── Kolkata routes ────────────────────────────────────────────
('SA601', 'Kolkata', 'Delhi',      NOW() + INTERVAL '1 day 8 hours',   NOW() + INTERVAL '1 day 10 hours 20 minutes','Boeing 737', 'scheduled', 4700),
('SA602', 'Kolkata', 'Delhi',      NOW() + INTERVAL '6 day 11 hours',  NOW() + INTERVAL '6 day 13 hours 20 minutes','Airbus A321','scheduled', 5100),

('SA611', 'Kolkata', 'Mumbai',     NOW() + INTERVAL '2 day 7 hours',   NOW() + INTERVAL '2 day 9 hours 30 minutes', 'Airbus A320','scheduled', 4900),
('SA612', 'Kolkata', 'Mumbai',     NOW() + INTERVAL '7 day 15 hours',  NOW() + INTERVAL '7 day 17 hours 30 minutes','Boeing 737', 'scheduled', 5200),

('SA621', 'Kolkata', 'Hyderabad',  NOW() + INTERVAL '3 day 10 hours',  NOW() + INTERVAL '3 day 12 hours 30 minutes','Airbus A320','scheduled', 4800),
('SA622', 'Kolkata', 'Hyderabad',  NOW() + INTERVAL '8 day 8 hours',   NOW() + INTERVAL '8 day 10 hours 30 minutes','Boeing 737', 'scheduled', 5100),

('SA631', 'Kolkata', 'Chennai',    NOW() + INTERVAL '4 day 9 hours',   NOW() + INTERVAL '4 day 11 hours 30 minutes','Airbus A321','scheduled', 4500),
('SA632', 'Kolkata', 'Chennai',    NOW() + INTERVAL '9 day 16 hours',  NOW() + INTERVAL '9 day 18 hours 30 minutes','Boeing 737', 'scheduled', 4800),

-- ── Ahmedabad routes ──────────────────────────────────────────
('SA701', 'Ahmedabad', 'Delhi',    NOW() + INTERVAL '1 day 9 hours',   NOW() + INTERVAL '1 day 10 hours 30 minutes','ATR 72',    'scheduled', 2900),
('SA702', 'Ahmedabad', 'Delhi',    NOW() + INTERVAL '5 day 14 hours',  NOW() + INTERVAL '5 day 15 hours 30 minutes','Airbus A320','scheduled', 3200),

('SA711', 'Ahmedabad', 'Mumbai',   NOW() + INTERVAL '2 day 8 hours',   NOW() + INTERVAL '2 day 9 hours',         'ATR 72',      'scheduled', 1700),
('SA712', 'Ahmedabad', 'Mumbai',   NOW() + INTERVAL '7 day 12 hours',  NOW() + INTERVAL '7 day 13 hours',        'Airbus A320', 'scheduled', 2000),

('SA721', 'Ahmedabad', 'Bangalore',NOW() + INTERVAL '3 day 7 hours',   NOW() + INTERVAL '3 day 9 hours 10 minutes','Boeing 737', 'scheduled', 3800),
('SA722', 'Ahmedabad', 'Bangalore',NOW() + INTERVAL '8 day 11 hours',  NOW() + INTERVAL '8 day 13 hours 10 minutes','Airbus A320','scheduled', 4100),

-- ── Pune routes ───────────────────────────────────────────────
('SA801', 'Pune', 'Delhi',         NOW() + INTERVAL '1 day 10 hours',  NOW() + INTERVAL '1 day 12 hours',        'Boeing 737',  'scheduled', 3800),
('SA802', 'Pune', 'Delhi',         NOW() + INTERVAL '6 day 7 hours',   NOW() + INTERVAL '6 day 9 hours',         'Airbus A320', 'scheduled', 4200),

('SA811', 'Pune', 'Mumbai',        NOW() + INTERVAL '2 day 9 hours',   NOW() + INTERVAL '2 day 9 hours 45 minutes','ATR 72',     'scheduled', 1300),
('SA812', 'Pune', 'Mumbai',        NOW() + INTERVAL '5 day 15 hours',  NOW() + INTERVAL '5 day 15 hours 45 minutes','ATR 72',    'scheduled', 1500),

('SA821', 'Pune', 'Bangalore',     NOW() + INTERVAL '3 day 11 hours',  NOW() + INTERVAL '3 day 12 hours 30 minutes','Airbus A320','scheduled', 2600),
('SA822', 'Pune', 'Bangalore',     NOW() + INTERVAL '9 day 8 hours',   NOW() + INTERVAL '9 day 9 hours 30 minutes', 'Boeing 737','scheduled', 2900);


-- ============================================================
-- 3. Generate seats for every flight (30 rows × 6 cols = 180 seats)
-- ============================================================
DO $$
DECLARE
  v_flight  RECORD;
  v_row     INT;
  v_col     TEXT;
  v_cols    TEXT[] := ARRAY['A','B','C','D','E','F'];
  v_class   TEXT;
  v_fee     NUMERIC;
BEGIN
  FOR v_flight IN SELECT id FROM public.flights LOOP
    FOR v_row IN 1..30 LOOP
      FOREACH v_col IN ARRAY v_cols LOOP

        IF v_row <= 3 THEN
          v_class := 'first';    v_fee := 5000;
        ELSIF v_row <= 8 THEN
          v_class := 'business'; v_fee := 2000;
        ELSE
          v_class := 'economy';
          v_fee := CASE WHEN v_col IN ('A','F') THEN 300 ELSE 0 END;
        END IF;

        INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (
          v_flight.id,
          v_row::TEXT || v_col,
          v_class,
          -- ~20% economy seats pre-occupied for realism
          CASE WHEN v_class = 'economy' AND random() < 0.2 THEN FALSE ELSE TRUE END,
          v_fee
        )
        ON CONFLICT DO NOTHING;

      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Verify
SELECT COUNT(*) AS total_flights FROM public.flights;
SELECT COUNT(*) AS total_seats   FROM public.seats;
SELECT origin, COUNT(*) AS flights FROM public.flights GROUP BY origin ORDER BY origin;
