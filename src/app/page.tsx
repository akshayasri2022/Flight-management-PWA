'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plane, MapPin, Calendar, Users, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { useFlightStore } from '@/lib/store'
import { AIRPORTS } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const { setSearchQuery, setBookingStep } = useFlightStore()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const swapCities = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!origin) e.origin = 'Select origin'
    if (!destination) e.destination = 'Select destination'
    if (origin === destination && origin) e.destination = 'Must differ from origin'
    if (!date) e.date = 'Select a date'
    if (new Date(date) < new Date(new Date().toDateString())) e.date = 'Date cannot be in the past'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSearch = () => {
    if (!validate()) return
    setSearchQuery({ origin, destination, date, passengerCount })
    setBookingStep('results')
    router.push(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&passengers=${passengerCount}`)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-[#020817]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f2d5e_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom-right,_#0c1a3d_0%,_transparent_50%)]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px,transparent 1px),linear-gradient(90deg,#ffffff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SkyRoute</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/bookings')}
            className="btn-secondary text-xs px-4 py-2">
            My Bookings
          </button>
          <button onClick={() => router.push('/login')}
            className="btn-primary text-xs px-4 py-2">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Realtime seat availability
        </div>

        <h1 className="animate-fade-up mb-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ animationDelay: '0.1s' }}>
          Your journey,<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            perfectly routed
          </span>
        </h1>

        <p className="animate-fade-up mb-12 max-w-lg text-slate-400 leading-relaxed"
          style={{ animationDelay: '0.2s' }}>
          Search, book, and manage flights in one place. Realtime seat maps, instant PNR codes, and effortless rescheduling.
        </p>

        {/* Search Card */}
        <div className="animate-fade-up w-full max-w-3xl" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card-elevated p-6 shadow-2xl shadow-blue-500/5">

            {/* Route row */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              {/* Origin */}
              <div className="flex-1">
                <label className="label">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className={cn('input-field pl-9', errors.origin && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}>
                    <option value="">Select city</option>
                    {AIRPORTS.map((a) => (
                      <option key={a.city} value={a.city}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
                {errors.origin && <p className="mt-1 text-xs text-red-400">{errors.origin}</p>}
              </div>

              {/* Swap button */}
              <button
                onClick={swapCities}
                className="mt-6 hidden sm:flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 transition hover:border-blue-500/50 hover:text-blue-400">
                <ArrowLeftRight className="h-4 w-4" />
              </button>

              {/* Destination */}
              <div className="flex-1">
                <label className="label">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className={cn('input-field pl-9', errors.destination && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')}>
                    <option value="">Select city</option>
                    {AIRPORTS.map((a) => (
                      <option key={a.city} value={a.city}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
                {errors.destination && <p className="mt-1 text-xs text-red-400">{errors.destination}</p>}
              </div>
            </div>

            {/* Date + passengers row */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="label">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={cn('input-field pl-9', errors.date && 'border-red-500 focus:border-red-500 focus:ring-red-500/20')} />
                </div>
                {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
              </div>

              <div className="sm:w-44">
                <label className="label">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="input-field pl-9">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSearch} className="btn-primary w-full py-4 text-base">
              Search Flights
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-up mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
          style={{ animationDelay: '0.4s' }}>
          {[
            { label: 'Routes', value: '4+' },
            { label: 'Flights', value: '8+' },
            { label: 'Seat Classes', value: '3' },
            { label: 'Realtime Updates', value: '✓' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-slate-200">{s.value}</div>
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
