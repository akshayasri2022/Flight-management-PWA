'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/store'
import { Plane, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { setSession } = useUserStore()

  const [email, setEmail] = useState('test@flightapp.com')
  const [password, setPassword] = useState('TestPass123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    setSession(data.session)
    router.push('/bookings')
  }

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f2d5e_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SkyRoute</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your bookings</p>
        </div>

        <div className="glass-card-elevated p-6">
          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button onClick={handleLogin} disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 text-xs text-slate-500">
            <div className="font-medium text-slate-400 mb-1">Test credentials:</div>
            <div>Email: test@flightapp.com</div>
            <div>Password: TestPass123!</div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
