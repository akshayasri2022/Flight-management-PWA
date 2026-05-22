'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore, useUserStore } from '@/lib/store'
import type { Flight, Seat } from '@/lib/types/database'
import { generatePNR, cn } from '@/lib/utils'
import { User, FileText, Globe, Calendar, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  flight: Flight
  seat: Seat
  totalPrice: number
  userId: string
}

export function PassengerFormClient({ flight, seat, totalPrice, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { passengerForm, setPassengerForm, resetBookingFlow, setBookingStep } = useFlightStore()
  const { } = useUserStore()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!passengerForm.fullName.trim()) e.fullName = 'Full name is required'
    if (!passengerForm.passportNo.trim()) e.passportNo = 'Passport number is required'
    if (passengerForm.passportNo.trim().length < 6) e.passportNo = 'Invalid passport number'
    if (!passengerForm.nationality.trim()) e.nationality = 'Nationality is required'
    if (!passengerForm.dob) e.dob = 'Date of birth is required'
    else {
      const age = (Date.now() - new Date(passengerForm.dob).getTime()) / (1000 * 60 * 60 * 24 * 365)
      if (age < 2) e.dob = 'Passenger must be at least 2 years old'
    }
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setError('')

    try {
      const pnr = generatePNR()

      const { data, error: rpcError } = await supabase.rpc('reserve_seat', {
        p_user_id:     userId,
        p_flight_id:   flight.id,
        p_seat_id:     seat.id,
        p_total_price: totalPrice,
        p_pnr_code:    pnr,
        p_full_name:   passengerForm.fullName.trim(),
        p_passport_no: passengerForm.passportNo.trim(),
        p_nationality: passengerForm.nationality.trim(),
        p_dob:         passengerForm.dob,
      })

      if (rpcError) throw new Error(rpcError.message)
      if (!data.success) throw new Error(data.error ?? 'Booking failed')

      setBookingStep('confirmation')
      router.push(`/booking/confirmation?pnr=${data.pnr_code}&bookingId=${data.booking_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    {
      id: 'fullName',
      label: 'Full Name (as on passport)',
      type: 'text',
      icon: User,
      value: passengerForm.fullName,
      placeholder: 'John Doe',
      onChange: (v: string) => setPassengerForm({ fullName: v }),
    },
    {
      id: 'passportNo',
      label: 'Passport Number',
      type: 'text',
      icon: FileText,
      value: passengerForm.passportNo,
      placeholder: 'A1234567',
      onChange: (v: string) => setPassengerForm({ passportNo: v.toUpperCase() }),
    },
    {
      id: 'nationality',
      label: 'Nationality',
      type: 'text',
      icon: Globe,
      value: passengerForm.nationality,
      placeholder: 'Indian',
      onChange: (v: string) => setPassengerForm({ nationality: v }),
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      type: 'date',
      icon: Calendar,
      value: passengerForm.dob,
      placeholder: '',
      onChange: (v: string) => setPassengerForm({ dob: v }),
    },
  ]

  return (
    <div className="glass-card p-6">
      <div className="space-y-5">
        {fields.map(({ id, label, type, icon: Icon, value, placeholder, onChange }) => (
          <div key={id}>
            <label htmlFor={id} className="label">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                max={id === 'dob' ? new Date().toISOString().split('T')[0] : undefined}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  'input-field pl-10',
                  fieldErrors[id] && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
              />
            </div>
            {fieldErrors[id] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{fieldErrors[id]}
              </p>
            )}
          </div>
        ))}

        {/* Passport privacy note */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-400">
          🔒 Your passport number is used for booking only and is never stored in your browser.
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-4 text-base">
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirming Booking…
            </>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </div>
    </div>
  )
}
