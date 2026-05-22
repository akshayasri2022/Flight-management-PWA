// ============================================================
// Database Types — mirrors Supabase schema exactly
// ============================================================

export type FlightStatus =
  | 'scheduled'
  | 'boarding'
  | 'departed'
  | 'arrived'
  | 'cancelled'
  | 'delayed'

export type SeatClass = 'economy' | 'business' | 'first'

export type BookingStatus = 'confirmed' | 'rescheduled' | 'cancelled'

export interface Flight {
  id: string
  flight_no: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  aircraft_type: string
  status: FlightStatus
  base_price: number
  created_at: string
}

export interface Seat {
  id: string
  flight_id: string
  seat_number: string
  class: SeatClass
  is_available: boolean
  extra_fee: number
}

export interface Booking {
  id: string
  user_id: string
  flight_id: string
  seat_id: string
  status: BookingStatus
  booked_at: string
  total_price: number
  pnr_code: string
}

export interface Passenger {
  id: string
  booking_id: string
  full_name: string
  passport_no: string
  nationality: string
  dob: string
}

export interface Reschedule {
  id: string
  booking_id: string
  old_flight_id: string
  new_flight_id: string
  requested_at: string
  fee_charged: number
}

// ── Joined / enriched types used in the UI ───────────────────

export interface BookingWithDetails extends Booking {
  flight: Flight
  seat: Seat
  passenger: Passenger
  reschedules?: Reschedule[]
}

export interface FlightSearchParams {
  origin: string
  destination: string
  date: string          // YYYY-MM-DD
  passengerCount: number
  class?: SeatClass
}

export interface SeatReservationPayload {
  userId: string
  flightId: string
  seatId: string
  totalPrice: number
  pnrCode: string
  fullName: string
  passportNo: string
  nationality: string
  dob: string
}

export interface SeatReservationResult {
  success: boolean
  booking_id?: string
  pnr_code?: string
  error?: string
}

export interface CancelBookingResult {
  success: boolean
  message?: string
  error?: string
}

export interface RescheduleBookingResult {
  success: boolean
  fee_charged?: number
  new_total?: number
  error?: string
}

// ── Supabase Database type (for createClient generics) ────────
export type Database = {
  public: {
    Tables: {
      flights: {
        Row: Flight
        Insert: Omit<Flight, 'id' | 'created_at'>
        Update: Partial<Omit<Flight, 'id' | 'created_at'>>
      }
      seats: {
        Row: Seat
        Insert: Omit<Seat, 'id'>
        Update: Partial<Omit<Seat, 'id'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'booked_at'>
        Update: Partial<Omit<Booking, 'id' | 'booked_at'>>
      }
      passengers: {
        Row: Passenger
        Insert: Omit<Passenger, 'id'>
        Update: Partial<Omit<Passenger, 'id'>>
      }
      reschedules: {
        Row: Reschedule
        Insert: Omit<Reschedule, 'id'>
        Update: Partial<Omit<Reschedule, 'id'>>
      }
    }
    Functions: {
      reserve_seat: {
        Args: SeatReservationPayload
        Returns: SeatReservationResult
      }
      cancel_booking: {
        Args: { p_booking_id: string; p_user_id: string }
        Returns: CancelBookingResult
      }
      reschedule_booking: {
        Args: {
          p_booking_id: string
          p_user_id: string
          p_new_flight_id: string
          p_new_seat_id: string
        }
        Returns: RescheduleBookingResult
      }
    }
  }
}
