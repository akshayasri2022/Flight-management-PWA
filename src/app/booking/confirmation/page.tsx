import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plane, CheckCircle2, Calendar, MapPin, User, Armchair } from 'lucide-react'
import { formatDateTime, formatPrice, getCityCode, flightDuration } from '@/lib/utils'
import type { Flight, Seat, Passenger } from '@/lib/types/database'

interface Props {
  searchParams: { pnr?: string; bookingId?: string }
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { pnr, bookingId } = searchParams
  if (!pnr || !bookingId) redirect('/')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*),
      seat:seats(*),
      passenger:passengers(*)
    `)
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) redirect('/')

  const flight = booking.flight as Flight
  const seat = booking.seat as Seat
  const passenger = Array.isArray(booking.passenger) ? booking.passenger[0] : booking.passenger

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2d1a_0%,_transparent_50%)] pointer-events-none" />

      <header className="relative border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">SkyRoute</span>
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-fade-up">
          {/* Success icon */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Booking Confirmed!</h1>
            <p className="mt-2 text-slate-400">Your flight has been booked successfully.</p>
          </div>

          {/* Boarding pass */}
          <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-emerald-500/5">
            {/* PNR header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-center">
              <div className="text-xs font-medium uppercase tracking-widest text-blue-100 mb-1">
                Booking Reference (PNR)
              </div>
              <div className="text-4xl font-black tracking-widest text-white font-mono">
                {booking.pnr_code}
              </div>
            </div>

            {/* Route */}
            <div className="bg-slate-900/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">{getCityCode(flight.origin)}</div>
                  <div className="text-sm text-slate-400">{flight.origin}</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Plane className="h-5 w-5 text-blue-400" />
                  <div className="text-xs text-slate-500">{flightDuration(flight.departs_at, flight.arrives_at)}</div>
                  <div className="text-xs font-mono text-slate-500">{flight.flight_no}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{getCityCode(flight.destination)}</div>
                  <div className="text-sm text-slate-400">{flight.destination}</div>
                </div>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="relative bg-slate-900/80">
              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#020817]" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#020817]" />
              <div className="border-t border-dashed border-slate-700/60 mx-4" />
            </div>

            {/* Details grid */}
            <div className="bg-slate-900/80 p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                  <Calendar className="h-3 w-3" /> Departure
                </div>
                <div className="font-medium text-slate-200">{formatDateTime(flight.departs_at)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                  <Armchair className="h-3 w-3" /> Seat
                </div>
                <div className="font-bold text-blue-400 font-mono">
                  {seat.seat_number} · <span className="capitalize">{seat.class}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                  <User className="h-3 w-3" /> Passenger
                </div>
                <div className="font-medium text-slate-200">{passenger?.full_name ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                  <MapPin className="h-3 w-3" /> Total Paid
                </div>
                <div className="font-bold text-emerald-400">{formatPrice(booking.total_price)}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/bookings" className="btn-primary flex-1 justify-center">
              View My Bookings
            </Link>
            <Link href="/" className="btn-secondary flex-1 justify-center">
              Book Another Flight
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            Cancellations allowed up to 2 hours before departure
          </p>
        </div>
      </main>
    </div>
  )
}
