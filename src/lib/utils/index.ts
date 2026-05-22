import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SeatClass } from '@/lib/types/database'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in INR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date/time for display
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}

// Calculate flight duration string
export function flightDuration(departs: string, arrives: string): string {
  const diff = new Date(arrives).getTime() - new Date(departs).getTime()
  const hours = Math.floor(diff / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  return `${hours}h ${mins}m`
}

// Generate a PNR code
export function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('')
}

// Check if a booking can be cancelled (> 2 hours before departure)
export function canCancel(departsAt: string): boolean {
  const departure = new Date(departsAt).getTime()
  const now = Date.now()
  return departure - now > 2 * 60 * 60 * 1000
}

// Returns minutes until cancellation window closes
export function minutesUntilCancellationDeadline(departsAt: string): number {
  const departure = new Date(departsAt).getTime()
  const deadline = departure - 2 * 60 * 60 * 1000
  return Math.floor((deadline - Date.now()) / 60_000)
}

// Seat class display labels
export const CLASS_LABELS: Record<SeatClass, string> = {
  first: 'First Class',
  business: 'Business',
  economy: 'Economy',
}

export const CLASS_COLORS: Record<SeatClass, string> = {
  first: 'text-amber-400',
  business: 'text-sky-400',
  economy: 'text-slate-400',
}

// Airport city → code mapping (minimal set for demo)
export const AIRPORTS: { city: string; code: string }[] = [
  { city: 'Delhi', code: 'DEL' },
  { city: 'Mumbai', code: 'BOM' },
  { city: 'Bangalore', code: 'BLR' },
  { city: 'Chennai', code: 'MAA' },
  { city: 'Hyderabad', code: 'HYD' },
  { city: 'Kolkata', code: 'CCU' },
  { city: 'Ahmedabad', code: 'AMD' },
  { city: 'Pune', code: 'PNQ' },
]

export function getCityCode(city: string): string {
  return AIRPORTS.find((a) => a.city === city)?.code ?? city.slice(0, 3).toUpperCase()
}
