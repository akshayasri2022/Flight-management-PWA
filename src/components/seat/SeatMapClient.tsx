'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/lib/store'
import type { Flight, Seat, SeatClass } from '@/lib/types/database'
import { formatPrice, cn } from '@/lib/utils'
import { Info, ChevronRight, Users } from 'lucide-react'

interface Props {
  flight: Flight
  initialSeats: Seat[]
  initialClass: SeatClass
  userId: string
}

const CLASS_ROWS: Record<SeatClass, [number, number]> = {
  first:    [1, 3],
  business: [4, 8],
  economy:  [9, 30],
}

const CLASS_COLORS = {
  first:    'bg-amber-900/60 border-amber-700/50',
  business: 'bg-sky-900/60 border-sky-700/50',
  economy:  'bg-slate-800/60 border-slate-700/50',
}

const COLS = ['A', 'B', 'C', '', 'D', 'E', 'F'] // '' = aisle gap

type SeatState = 'available' | 'occupied' | 'selected' | 'yours'

export function SeatMapClient({ flight, initialSeats, initialClass, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { setSelectedSeat, setOptimisticSeat, optimisticSeatId, setBookingStep } = useFlightStore()

  const [seats, setSeats] = useState<Map<string, Seat>>(
    () => new Map(initialSeats.map((s) => [s.id, s]))
  )
  const [selectedId, setSelectedId] = useState<string | null>(optimisticSeatId)
  const [activeClass, setActiveClass] = useState<SeatClass>(initialClass)
  const [tooltip, setTooltip] = useState<{ seat: Seat; x: number; y: number } | null>(null)
  const [liveUpdates, setLiveUpdates] = useState<string[]>([])

  // ── Supabase Realtime subscription ───────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`seats-flight-${flight.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flight.id}`,
        },
        (payload) => {
          const updated = payload.new as Seat
          setSeats((prev) => {
            const next = new Map(prev)
            next.set(updated.id, updated)
            return next
          })
          // Show live update toast if someone else booked a seat
          if (!updated.is_available && updated.id !== selectedId) {
            setLiveUpdates((prev) => [`Seat ${updated.seat_number} was just booked`, ...prev.slice(0, 2)])
            setTimeout(() => setLiveUpdates((prev) => prev.slice(0, -1)), 3000)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [flight.id, selectedId, supabase])

  const getSeatState = useCallback((seat: Seat): SeatState => {
    if (seat.id === selectedId) return 'selected'
    if (!seat.is_available) return 'occupied'
    return 'available'
  }, [selectedId])

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return
    if (seat.class !== activeClass) return

    // Optimistic selection
    setSelectedId(seat.id)
    setOptimisticSeat(seat.id)
    setSelectedSeat(seat)
    setTooltip(null)
  }

  const handleContinue = () => {
    if (!selectedId) return
    const seat = seats.get(selectedId)
    if (!seat) return
    setBookingStep('passenger-details')
    router.push(`/booking/passenger-details?flightId=${flight.id}&seatId=${selectedId}`)
  }

  const selectedSeat = selectedId ? seats.get(selectedId) : null
  const totalPrice = selectedSeat ? flight.base_price + selectedSeat.extra_fee : flight.base_price

  // Build seat grid for current class
  const [rowStart, rowEnd] = CLASS_ROWS[activeClass]
  const classSeats = Array.from(seats.values()).filter((s) => s.class === activeClass)
  const availableCount = classSeats.filter((s) => s.is_available).length

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ── Seat Map ─────────────────────────────────────────── */}
      <div className="flex-1">
        {/* Class tabs */}
        <div className="mb-4 flex gap-2">
          {(['first', 'business', 'economy'] as SeatClass[]).map((cls) => (
            <button
              key={cls}
              onClick={() => { setActiveClass(cls); setSelectedId(null); setSelectedSeat(null) }}
              className={cn(
                'rounded-xl border px-4 py-2 text-sm font-medium capitalize transition-all',
                activeClass === cls
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
              )}>
              {cls === 'first' ? 'First Class' : cls.charAt(0).toUpperCase() + cls.slice(1)}
            </button>
          ))}
        </div>

        {/* Available count */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <Users className="h-4 w-4" />
          <span>{availableCount} seats available in {activeClass}</span>
        </div>

        {/* Realtime toast */}
        {liveUpdates.length > 0 && (
          <div className="mb-3 animate-fade-in rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
            🔴 Live: {liveUpdates[0]}
          </div>
        )}

        {/* Aircraft nose indicator */}
        <div className="mb-2 flex justify-center">
          <div className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1 text-xs text-slate-500">
            ✈ Front of Aircraft
          </div>
        </div>

        {/* Column labels */}
        <div className="mb-1 flex items-center justify-center gap-1 px-8">
          {COLS.map((col, i) => (
            <div key={`${col}-${i}`}
              className={cn('flex h-6 items-center justify-center text-xs font-medium text-slate-600',
                col === '' ? 'w-4' : 'w-9')}>
              {col}
            </div>
          ))}
        </div>

        {/* Seat rows — scrollable */}
        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 p-3 sm:p-4">
          <div className={cn('rounded-lg p-3', CLASS_COLORS[activeClass])}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
              {activeClass === 'first' ? 'First Class' : activeClass === 'business' ? 'Business Class' : 'Economy Class'}
            </div>
            {Array.from({ length: rowEnd - rowStart + 1 }, (_, i) => {
              const row = rowStart + i
              return (
                <div key={row} className="mb-1 flex items-center justify-center gap-1">
                  <div className="w-6 text-right text-xs text-slate-600 font-mono">{row}</div>
                  {COLS.map((col, ci) => {
                    if (col === '') return <div key={`gap-${ci}`} className="w-4" />
                    const seatNo = `${row}${col}`
                    const seat = Array.from(seats.values()).find(
                      (s) => s.seat_number === seatNo && s.class === activeClass
                    )
                    if (!seat) return <div key={seatNo} className="w-9 h-8" />

                    const state = getSeatState(seat)
                    return (
                      <button
                        key={seatNo}
                        disabled={state === 'occupied'}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({ seat, x: rect.left, y: rect.top })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        title={`${seatNo} - ${seat.class}${seat.extra_fee > 0 ? ` (+₹${seat.extra_fee})` : ''}`}
                        className={cn(
                          'relative h-8 w-9 rounded-t-lg border text-xs font-bold transition-all duration-150',
                          state === 'available' && 'bg-blue-900/40 border-blue-800/60 text-blue-300 hover:bg-blue-600 hover:border-blue-500 hover:scale-110 cursor-pointer',
                          state === 'selected' && 'bg-blue-500 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/40 cursor-pointer',
                          state === 'occupied' && 'bg-slate-800 border-slate-700 text-slate-700 cursor-not-allowed opacity-50',
                          state === 'yours' && 'bg-cyan-500 border-cyan-400 text-white'
                        )}>
                        {col}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {[
            { color: 'bg-blue-900/40 border-blue-800/60', label: 'Available' },
            { color: 'bg-blue-500 border-blue-400', label: 'Selected' },
            { color: 'bg-slate-800 border-slate-700 opacity-50', label: 'Occupied' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={cn('h-4 w-4 rounded border', l.color)} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Booking Summary sidebar ──────────────────────────── */}
      <div className="lg:w-72 xl:w-80">
        <div className="glass-card-elevated p-5 lg:sticky lg:top-6">
          <h3 className="mb-4 text-base font-semibold text-white">Booking Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Flight</span>
              <span className="font-mono font-medium text-slate-200">{flight.flight_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Class</span>
              <span className="capitalize text-slate-200">{activeClass}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seat</span>
              <span className={cn('font-mono font-bold', selectedSeat ? 'text-blue-400' : 'text-slate-600')}>
                {selectedSeat ? selectedSeat.seat_number : '—'}
              </span>
            </div>

            <div className="border-t border-slate-700/60 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Base fare</span>
                <span className="text-slate-200">{formatPrice(flight.base_price)}</span>
              </div>
              {selectedSeat && selectedSeat.extra_fee > 0 && (
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400">Seat fee</span>
                  <span className="text-slate-200">+{formatPrice(selectedSeat.extra_fee)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-700/60 pt-3 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-blue-400">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {!selectedSeat ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-800/60 p-3 text-xs text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              Click a seat on the map to select it
            </div>
          ) : (
            <button onClick={handleContinue} className="btn-primary w-full mt-4">
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div className="mt-3 text-center text-xs text-slate-600">
            Free cancellation up to 2h before departure
          </div>
        </div>
      </div>
    </div>
  )
}
