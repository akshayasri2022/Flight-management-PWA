import { createClient } from '@/lib/supabase/server'
import { SeatMapClient } from '@/components/seat/SeatMapClient'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, ArrowLeft } from 'lucide-react'
import { formatTime, getCityCode, formatDate } from '@/lib/utils'
import type { SeatClass } from '@/lib/types/database'

interface Props {
  searchParams: {
    flightId?: string
    class?: string
  }
}

export default async function SeatSelectionPage({ searchParams }: Props) {
  const { flightId, class: seatClass } = searchParams
  if (!flightId) redirect('/')

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/booking/seat-selection')

  const [{ data: flight }, { data: seats }] = await Promise.all([
    supabase.from('flights').select('*').eq('id', flightId).single(),
    supabase.from('seats').select('*').eq('flight_id', flightId).order('seat_number'),
  ])

  if (!flight) redirect('/search')

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f2d5e_0%,_transparent_40%)] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">SkyRoute</span>
          </Link>
          <Link href="/search" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> Back to Results
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="relative border-b border-slate-800/40 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {['Search', 'Select Seat', 'Passenger Details', 'Confirmation'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-700">›</span>}
                <span className={i === 1 ? 'text-blue-400 font-medium' : ''}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="relative page-container">
        {/* Flight summary */}
        <div className="mb-6 glass-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="font-mono text-sm text-slate-400">{flight.flight_no}</div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <span>{getCityCode(flight.origin)}</span>
              <Plane className="h-4 w-4 text-blue-400" />
              <span>{getCityCode(flight.destination)}</span>
            </div>
            <div className="hidden sm:block text-sm text-slate-400">
              {formatDate(flight.departs_at)} · {formatTime(flight.departs_at)} – {formatTime(flight.arrives_at)}
            </div>
          </div>
          <div className="text-sm font-medium text-slate-300">{flight.aircraft_type}</div>
        </div>

        <h1 className="section-title mb-6">Select Your Seat</h1>

        <SeatMapClient
          flight={flight}
          initialSeats={seats ?? []}
          initialClass={(seatClass as SeatClass) || 'economy'}
          userId={user.id}
        />
      </main>
    </div>
  )
}
