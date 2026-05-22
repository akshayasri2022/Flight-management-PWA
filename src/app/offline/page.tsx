export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">✈️</div>
      <h1 className="text-3xl font-bold text-white mb-3">You're offline</h1>
      <p className="text-slate-400 max-w-sm mb-6">
        No internet connection detected. Your cached bookings are still available — head to My Bookings.
      </p>
      <a href="/bookings" className="btn-primary inline-flex">
        View Cached Bookings
      </a>
      <p className="mt-4 text-xs text-slate-600">
        Flight search requires an active connection.
      </p>
    </div>
  )
}
