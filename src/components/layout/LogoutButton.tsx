'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore, useFlightStore } from '@/lib/store'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const { resetUser } = useUserStore()
  const { resetBookingFlow } = useFlightStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Reset both stores on logout — clears session + in-progress booking
    resetUser()
    resetBookingFlow()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-secondary text-xs px-3 py-2 gap-1.5">
      <LogOut className="h-3.5 w-3.5" />
      Logout
    </button>
  )
}
