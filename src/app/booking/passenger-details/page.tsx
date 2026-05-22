import { createClient } from '@/lib/supabase/server'
import { PassengerFormClient } from '@/components/booking/PassengerFormClient'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, ArrowLeft } from 'lucide-react'
import { formatTime, formatPrice, getCityCode } from '@/lib/utils'

interface Props {
  searchParams: { flightId?: string; seatId?: string }
}

export default async function PassengerDetailsPage({ searchParams }: Props) {
  const { flightId, seatId } = searchParams
  if (!flightId || !seatId) redirect('/')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/booking/passenger-details')

  const flightQuery = supabase
  .from('flights')
  .select('*')
  .eq('id', flightId)
  .single()

const seatQuery = supabase
  .from('seats')
  .select('*')
  .eq('id', seatId)
  .single()

const [
  { data: flight },
  { data: seat }
] = await Promise.all([flightQuery, seatQuery])

if (!flight || !seat) redirect('/search')

const totalPrice =
  Number(flight.base_price) + Number(seat.extra_fee)

  if (!flight || !seat) redirect('/search')

  const totalPrice = flight.base_price + seat.extra_fee

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f2d5e_0%,_transparent_40%)] pointer-events-none" />

      <header className="relative border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">SkyRoute</span>
          </Link>
          <Link href={`/booking/seat-selection?flightId=${flightId}`}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> Back to Seats
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
                <span className={i === 2 ? 'text-blue-400 font-medium' : ''}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="relative page-container">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <h1 className="section-title mb-6">Passenger Details</h1>
            <PassengerFormClient
              flight={flight}
              seat={seat}
              totalPrice={totalPrice}
              userId={user.id}
            />
          </div>

          {/* Summary */}
          <div>
            <div className="glass-card-elevated p-5 lg:sticky lg:top-6">
              <h3 className="mb-4 text-base font-semibold text-white">Trip Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Route</div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span>{getCityCode(flight.origin)}</span>
                    <Plane className="h-3.5 w-3.5 text-blue-400" />
                    <span>{getCityCode(flight.destination)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Departure</div>
                  <div className="font-mono text-slate-200">{formatTime(flight.departs_at)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Seat</div>
                  <div className="font-mono font-bold text-blue-400">{seat.seat_number} · {seat.class}</div>
                </div>
                <div className="border-t border-slate-700/60 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-blue-400">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
