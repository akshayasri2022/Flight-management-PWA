import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Flight, Seat, SeatClass, FlightSearchParams } from '@/lib/types/database'

// ── Types ─────────────────────────────────────────────────────

export type BookingStep =
  | 'search'
  | 'results'
  | 'seat-selection'
  | 'passenger-details'
  | 'confirmation'

export interface PassengerFormData {
  fullName: string
  passportNo: string       // EXCLUDED from localStorage via partialize
  nationality: string
  dob: string
}

interface FlightState {
  // Search
  searchQuery: FlightSearchParams | null
  searchResults: Flight[]

  // Selection
  selectedFlight: Flight | null
  selectedSeat: Seat | null

  // Booking step tracker
  bookingStep: BookingStep

  // Passenger form (partially persisted — passport excluded)
  passengerForm: PassengerFormData

  // Optimistic seat selection (before Supabase confirms)
  optimisticSeatId: string | null

  // Actions
  setSearchQuery: (query: FlightSearchParams) => void
  setSearchResults: (flights: Flight[]) => void
  setSelectedFlight: (flight: Flight | null) => void
  setSelectedSeat: (seat: Seat | null) => void
  setOptimisticSeat: (seatId: string | null) => void
  setBookingStep: (step: BookingStep) => void
  setPassengerForm: (data: Partial<PassengerFormData>) => void
  resetBookingFlow: () => void
}

const defaultPassengerForm: PassengerFormData = {
  fullName: '',
  passportNo: '',
  nationality: '',
  dob: '',
}

// ── Store ─────────────────────────────────────────────────────

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchQuery: null,
      searchResults: [],
      selectedFlight: null,
      selectedSeat: null,
      bookingStep: 'search',
      passengerForm: defaultPassengerForm,
      optimisticSeatId: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (flights) => set({ searchResults: flights }),

      setSelectedFlight: (flight) =>
        set({ selectedFlight: flight, selectedSeat: null, optimisticSeatId: null }),

      setSelectedSeat: (seat) => set({ selectedSeat: seat }),

      // Optimistic seat selection — marks seat in store before Supabase write
      setOptimisticSeat: (seatId) => set({ optimisticSeatId: seatId }),

      setBookingStep: (step) => set({ bookingStep: step }),

      setPassengerForm: (data) =>
        set((state) => ({
          passengerForm: { ...state.passengerForm, ...data },
        })),

      resetBookingFlow: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: 'search',
          passengerForm: defaultPassengerForm,
          optimisticSeatId: null,
          // Keep searchQuery so user can quickly re-search
        }),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),

      // ── partialize: exclude sensitive fields from localStorage ──
      // passportNo is NEVER written to localStorage
      partialize: (state): Partial<FlightState> => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        passengerForm: {
          fullName: state.passengerForm.fullName,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
          passportNo: '',  // Always excluded — never persisted
        },
      }),
    }
  )
)
