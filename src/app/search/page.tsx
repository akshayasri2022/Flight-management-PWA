import { createClient } from '@/lib/supabase/server'
import { FlightResultsClient } from '@/components/flight/FlightResultsClient'
import { Plane, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getCityCode, formatDateTime } from '@/lib/utils'

interface SearchPageProps {
  searchParams: {
    origin?: string
    destination?: string
    date?: string
    passengers?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { origin, destination, date, passengers } = searchParams

  if (!origin || !destination) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-slate-400 mb-4">Missing search parameters.</p>
        <Link href="/" className="btn-primary">Back to Search</Link>
      </div>
    )
  }

  const supabase = createClient()

  // Always show ALL upcoming flights on the route — no date filter
  const { data: flights, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .neq('status', 'cancelled')
    .gte('departs_at', new Date().toISOString())
    .order('departs_at', { ascending: true })
    .limit(20)

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f2d5e_0%,_transparent_40%)] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">SkyRoute</span>
            </Link>

            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-white">{getCityCode(origin)}</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="text-white">{getCityCode(destination)}</span>
              <span className="hidden sm:inline ml-2 text-slate-400">
                · {passengers ?? 1} pax
              </span>
            </div>

            <Link href="/bookings" className="btn-secondary text-xs px-4 py-2">
              My Bookings
            </Link>
          </div>
        </div>
      </header>

      <main className="relative page-container">
        <div className="mb-6">
          <h1 className="section-title">
            {origin} <span className="text-slate-500 mx-2">→</span> {destination}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All upcoming flights · {passengers ?? 1} passenger{Number(passengers) > 1 ? 's' : ''}
            {flights && flights.length > 0 && ` · ${flights.length} flight${flights.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Info banner */}
        {flights && flights.length > 0 && (
          <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-400">
            💡 Showing all upcoming flights on this route — pick any to book
          </div>
        )}

        {error ? (
          <div className="glass-card p-8 text-center text-red-400">
            Failed to load flights. Please try again.
          </div>
        ) : !flights || flights.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Plane className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <p className="text-lg font-semibold text-slate-300">No flights on this route</p>
            <p className="mt-1 text-sm text-slate-500">Try a different route or run the seed SQL.</p>
            <Link href="/" className="btn-primary mt-6 inline-flex">New Search</Link>
          </div>
        ) : (
          <FlightResultsClient
            flights={flights}
            passengerCount={Number(passengers) || 1}
          />
        )}
      </main>
    </div>
  )
}
