'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore, useUserStore } from '@/lib/store'
import type { BookingWithDetails, Flight, Seat } from '@/lib/types/database'
import {
  formatDateTime, formatPrice, getCityCode, flightDuration,
  canCancel, minutesUntilCancellationDeadline, cn
} from '@/lib/utils'
import {
  Plane, Calendar, Armchair, AlertTriangle, X, RefreshCw,
  Clock, CheckCircle2, Loader2, ChevronDown, ChevronUp
} from 'lucide-react'

interface Props {
  initialBookings: BookingWithDetails[]
  userId: string
}

export function BookingsClient({ initialBookings, userId }: Props) {
  const supabase = createClient()
  const { resetBookingFlow } = useFlightStore()
  const { updateCachedBookingStatus } = useUserStore()

  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)
  const [rescheduleDialog, setRescheduleDialog] = useState<string | null>(null)
  const [altFlights, setAltFlights] = useState<Flight[]>([])
  const [altSeats, setAltSeats] = useState<Seat[]>([])
  const [selectedAltFlight, setSelectedAltFlight] = useState<Flight | null>(null)
  const [selectedAltSeat, setSelectedAltSeat] = useState<Seat | null>(null)
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  const updateLocalBooking = (id: string, update: Partial<BookingWithDetails>) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...update } : b))
  }

  // ── Cancel ───────────────────────────────────────────────────
  const handleCancel = async (bookingId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId,
        p_user_id: userId,
      })
      if (error) throw new Error(error.message)
      if (!data.success) throw new Error(data.error)

      updateLocalBooking(bookingId, { status: 'cancelled' })
      updateCachedBookingStatus(bookingId, 'cancelled')
      resetBookingFlow()
      setCancelDialog(null)
      showToast('Booking cancelled successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Load alt flights for reschedule ─────────────────────────
  const openReschedule = async (booking: BookingWithDetails) => {
    setRescheduleDialog(booking.id)
    setSelectedAltFlight(null)
    setSelectedAltSeat(null)
    setAltSeats([])

    const { data } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', booking.flight.origin)
      .eq('destination', booking.flight.destination)
      .neq('id', booking.flight_id)
      .neq('status', 'cancelled')
      .gte('departs_at', new Date().toISOString())
      .order('departs_at')

    setAltFlights(data ?? [])
  }

  const selectAltFlight = async (flight: Flight) => {
    setSelectedAltFlight(flight)
    setSelectedAltSeat(null)
    const { data } = await supabase
      .from('seats')
      .select('*')
      .eq('flight_id', flight.id)
      .eq('is_available', true)
      .order('seat_number')
    setAltSeats(data ?? [])
  }

  // ── Reschedule ───────────────────────────────────────────────
  const handleReschedule = async (bookingId: string) => {
    if (!selectedAltFlight || !selectedAltSeat) return
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('reschedule_booking', {
        p_booking_id: bookingId,
        p_user_id: userId,
        p_new_flight_id: selectedAltFlight.id,
        p_new_seat_id: selectedAltSeat.id,
      })
      if (error) throw new Error(error.message)
      if (!data.success) throw new Error(data.error)

      updateLocalBooking(bookingId, {
        status: 'rescheduled',
        flight: selectedAltFlight,
        flight_id: selectedAltFlight.id,
        seat: selectedAltSeat,
        seat_id: selectedAltSeat.id,
        total_price: data.new_total,
      })
      updateCachedBookingStatus(bookingId, 'rescheduled')
      setRescheduleDialog(null)
      showToast(`Rescheduled! ${data.fee_charged > 0 ? `Fare difference: ${formatPrice(data.fee_charged)}` : 'No additional charge.'}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reschedule failed')
    } finally {
      setLoading(false)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Plane className="mx-auto mb-4 h-12 w-12 text-slate-600" />
        <p className="text-lg font-semibold text-slate-300">No bookings yet</p>
        <p className="mt-1 text-sm text-slate-500">Search for flights to get started.</p>
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in glass-card-elevated border-blue-500/30 px-4 py-3 text-sm text-slate-200 shadow-lg">
          {toastMsg}
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => {
          const flight = booking.flight as Flight
          const seat = booking.seat as Seat
          const passenger = Array.isArray(booking.passenger) ? booking.passenger[0] : booking.passenger
          const isExpanded = expanded === booking.id
          const cancellable = canCancel(flight.departs_at) && booking.status === 'confirmed'
          const minsLeft = minutesUntilCancellationDeadline(flight.departs_at)

          return (
            <div key={booking.id} className="glass-card overflow-hidden transition-all">
              {/* Main row */}
              <div
                className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-center hover:bg-slate-800/20 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : booking.id)}>

                {/* Route */}
                <div className="flex flex-1 items-center gap-6">
                  <div>
                    <div className="text-xl font-bold text-white">{getCityCode(flight.origin)}</div>
                    <div className="text-xs text-slate-500">{flight.origin}</div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Plane className="h-4 w-4 text-blue-400" />
                    <div className="text-xs text-slate-600 font-mono">{flight.flight_no}</div>
                    <div className="text-xs text-slate-600">{flightDuration(flight.departs_at, flight.arrives_at)}</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{getCityCode(flight.destination)}</div>
                    <div className="text-xs text-slate-500">{flight.destination}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status badge */}
                  <span className={cn(
                    booking.status === 'confirmed' && 'status-confirmed',
                    booking.status === 'rescheduled' && 'status-rescheduled',
                    booking.status === 'cancelled' && 'status-cancelled',
                  )}>
                    {booking.status === 'confirmed' && <CheckCircle2 className="h-3 w-3" />}
                    {booking.status === 'rescheduled' && <RefreshCw className="h-3 w-3" />}
                    {booking.status === 'cancelled' && <X className="h-3 w-3" />}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>

                  <div className="hidden sm:block text-right">
                    <div className="font-mono text-xs text-slate-500">{booking.pnr_code}</div>
                    <div className="font-bold text-blue-400">{formatPrice(booking.total_price)}</div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-slate-800/60 p-5 animate-fade-in">
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                        <Calendar className="h-3 w-3" /> Departure
                      </div>
                      <div className="text-slate-200">{formatDateTime(flight.departs_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                        <Armchair className="h-3 w-3" /> Seat
                      </div>
                      <div className="font-bold text-blue-400 font-mono">
                        {seat?.seat_number} · <span className="capitalize">{seat?.class}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Passenger</div>
                      <div className="text-slate-200">{passenger?.full_name ?? 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Total</div>
                      <div className="font-bold text-emerald-400">{formatPrice(booking.total_price)}</div>
                    </div>
                  </div>

                  {/* Cancellation window warning */}
                  {booking.status !== 'cancelled' && minsLeft > 0 && minsLeft < 180 && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Cancellation window closes in {minsLeft} minutes
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status !== 'cancelled' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openReschedule(booking)}
                        className="btn-secondary text-xs px-4 py-2 gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reschedule
                      </button>
                      {cancellable ? (
                        <button
                          onClick={() => setCancelDialog(booking.id)}
                          className="btn-danger text-xs px-4 py-2 gap-1.5">
                          <X className="h-3.5 w-3.5" />
                          Cancel Booking
                        </button>
                      ) : booking.status === 'confirmed' ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 px-4">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Cancellation window closed
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Cancel Dialog ─────────────────────────────────────── */}
      {cancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-elevated w-full max-w-md p-6 animate-fade-up">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Cancel Booking?</h3>
            <p className="mb-6 text-sm text-slate-400">
              This action cannot be undone. Your seat will be released and made available to other passengers.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelDialog(null)} className="btn-secondary flex-1">
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancelDialog)}
                disabled={loading}
                className="btn-danger flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule Dialog ─────────────────────────────────── */}
      {rescheduleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-elevated w-full max-w-lg p-6 animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Reschedule Flight</h3>
              <button onClick={() => setRescheduleDialog(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step 1: pick alternate flight */}
            <div className="mb-4">
              <p className="mb-3 text-sm text-slate-400">Select an alternative flight on the same route:</p>
              {altFlights.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-6">No alternative flights available.</div>
              ) : (
                <div className="space-y-2">
                  {altFlights.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => selectAltFlight(f)}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left text-sm transition-all',
                        selectedAltFlight?.id === f.id
                          ? 'border-blue-500 bg-blue-600/20'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                      )}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-medium text-slate-200">{f.flight_no}</span>
                        <span className="font-bold text-blue-400">{formatPrice(f.base_price)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDateTime(f.departs_at)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: pick seat */}
            {selectedAltFlight && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-slate-400">Select a seat:</p>
                <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                  {altSeats.slice(0, 24).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedAltSeat(s)}
                      className={cn(
                        'rounded-lg border p-2 text-xs font-mono transition-all text-center',
                        selectedAltSeat?.id === s.id
                          ? 'border-blue-500 bg-blue-600/30 text-blue-300'
                          : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                      )}>
                      {s.seat_number}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setRescheduleDialog(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(rescheduleDialog)}
                disabled={!selectedAltFlight || !selectedAltSeat || loading}
                className="btn-primary flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
