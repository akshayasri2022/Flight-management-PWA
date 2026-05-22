'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plane, Clock, ChevronRight, Zap } from 'lucide-react'
import type { Flight, SeatClass } from '@/lib/types/database'
import { useFlightStore } from '@/lib/store'
import { formatTime, formatPrice, flightDuration, getCityCode, cn } from '@/lib/utils'

interface Props {
  flights: Flight[]
  passengerCount: number
}

const CLASS_OPTIONS: { value: SeatClass; label: string; multiplier: number }[] = [
  { value: 'economy', label: 'Economy', multiplier: 1 },
  { value: 'business', label: 'Business', multiplier: 1.8 },
  { value: 'first', label: 'First', multiplier: 3.2 },
]

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'On Time', color: 'text-emerald-400' },
  boarding:  { label: 'Boarding', color: 'text-amber-400' },
  delayed:   { label: 'Delayed', color: 'text-red-400' },
  departed:  { label: 'Departed', color: 'text-slate-400' },
}

export function FlightResultsClient({ flights, passengerCount }: Props) {
  const router = useRouter()
  const { setSelectedFlight, setBookingStep } = useFlightStore()
  const [selectedClass, setSelectedClass] = useState<SeatClass>('economy')

  const handleSelect = (flight: Flight) => {
    setSelectedFlight(flight)
    setBookingStep('seat-selection')
    router.push(`/booking/seat-selection?flightId=${flight.id}&class=${selectedClass}`)
  }

  return (
    <div>
      {/* Class filter */}
      <div className="mb-6 flex gap-2">
        {CLASS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedClass(opt.value)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium transition-all',
              selectedClass === opt.value
                ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
            )}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Flight cards */}
      <div className="space-y-3">
        {flights.map((flight, i) => {
          const cls = CLASS_OPTIONS.find((c) => c.value === selectedClass)!
          const displayPrice = flight.base_price * cls.multiplier
          const status = STATUS_CONFIG[flight.status] ?? { label: flight.status, color: 'text-slate-400' }

          return (
            <div
              key={flight.id}
              className="glass-card p-5 transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: route info */}
                <div className="flex flex-1 items-center gap-4 sm:gap-8">
                  {/* Departure */}
                  <div className="min-w-[64px]">
                    <div className="text-2xl font-bold text-white font-mono">
                      {formatTime(flight.departs_at)}
                    </div>
                    <div className="text-sm font-semibold text-slate-300">{getCityCode(flight.origin)}</div>
                  </div>

                  {/* Route line */}
                  <div className="flex flex-1 flex-col items-center gap-1 min-w-0">
                    <div className="flex w-full items-center gap-2">
                      <div className="h-px flex-1 bg-slate-700" />
                      <Plane className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                      <div className="h-px flex-1 bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {flightDuration(flight.departs_at, flight.arrives_at)}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="min-w-[64px] text-right sm:text-left">
                    <div className="text-2xl font-bold text-white font-mono">
                      {formatTime(flight.arrives_at)}
                    </div>
                    <div className="text-sm font-semibold text-slate-300">{getCityCode(flight.destination)}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-12 w-px bg-slate-800" />

                {/* Right: details + CTA */}
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
                  <div>
                    <div className="text-xs text-slate-500 font-mono">{flight.flight_no}</div>
                    <div className="text-xs text-slate-500">{flight.aircraft_type}</div>
                    <div className={`text-xs font-medium ${status.color}`}>{status.label}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(displayPrice)}
                    </div>
                    <div className="text-xs text-slate-500">per person · {cls.label}</div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSelect(flight)}
                  className="btn-primary w-full sm:w-auto whitespace-nowrap">
                  Select
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom badges */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-800/60 pt-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Zap className="h-3 w-3 text-blue-400" />
                  Instant confirmation
                </div>
                <span className="text-slate-700">·</span>
                <div className="text-xs text-slate-500">Free cancellation (2h before departure)</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
