import { createClient } from '@/lib/supabase/server'
import { BookingsClient } from '@/components/booking/BookingsClient'
import { redirect } from 'next/navigation'
import type { BookingWithDetails } from '@/lib/types/database'
import Link from 'next/link'
import { Plane, Plus } from 'lucide-react'
import { LogoutButton } from '@/components/layout/LogoutButton'

export default async function BookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/bookings')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*),
      seat:seats(*),
      passenger:passengers(*)
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

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
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-primary text-xs px-4 py-2 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Booking
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="relative page-container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="section-title">My Bookings</h1>
            <p className="mt-1 text-sm text-slate-400">
              {bookings?.length ?? 0} booking{(bookings?.length ?? 0) !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {user.email}
          </div>
        </div>

        <BookingsClient initialBookings={(bookings ?? []) as BookingWithDetails[]} userId={user.id} />
      </main>
    </div>
  )
}
