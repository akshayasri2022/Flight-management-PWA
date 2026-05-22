import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import type { BookingWithDetails } from '@/lib/types/database'

// ── Types ─────────────────────────────────────────────────────

interface UserState {
  session: Session | null
  user: User | null
  cachedBookings: BookingWithDetails[]   // NOT persisted — fetched fresh on load
  isLoadingBookings: boolean

  // Actions
  setSession: (session: Session | null) => void
  setCachedBookings: (bookings: BookingWithDetails[]) => void
  setLoadingBookings: (loading: boolean) => void
  updateCachedBookingStatus: (
    bookingId: string,
    status: 'confirmed' | 'rescheduled' | 'cancelled'
  ) => void
  resetUser: () => void
}

// ── Store ─────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      cachedBookings: [],
      isLoadingBookings: false,

      setSession: (session) =>
        set({
          session,
          user: session?.user ?? null,
        }),

      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),

      setLoadingBookings: (loading) => set({ isLoadingBookings: loading }),

      // Optimistic update for booking status changes
      updateCachedBookingStatus: (bookingId, status) =>
        set({
          cachedBookings: get().cachedBookings.map((b) =>
            b.id === bookingId ? { ...b, status } : b
          ),
        }),

      resetUser: () =>
        set({
          session: null,
          user: null,
          cachedBookings: [],
        }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),

      // Only persist the session token — never cache booking data locally
      partialize: (state): Partial<UserState> => ({
        session: state.session,
        user: state.user,
      }),
    }
  )
)
