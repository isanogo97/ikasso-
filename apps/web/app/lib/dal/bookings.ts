import { getStorageMode } from './config'

export interface Booking {
  id: string
  propertyId: string
  guestId: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  subtotal: number
  serviceFee: number
  total: number
  guestFirstName: string
  guestLastName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  paymentMethod: string
  paymentId: string
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  createdAt: string
  // Joined data
  property?: {
    name: string
    location: string
    image: string
  }
}

function mapSupabaseBooking(row: any): Booking {
  return {
    id: row.id,
    propertyId: row.property_id,
    guestId: row.guest_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    status: row.status,
    subtotal: row.subtotal,
    serviceFee: row.service_fee,
    total: row.total,
    guestFirstName: row.guest_first_name || '',
    guestLastName: row.guest_last_name || '',
    guestEmail: row.guest_email || '',
    guestPhone: row.guest_phone || '',
    specialRequests: row.special_requests || '',
    paymentMethod: row.payment_method || '',
    paymentId: row.payment_id || '',
    paymentStatus: row.payment_status || 'pending',
    createdAt: row.created_at,
    property: row.properties ? {
      name: row.properties.title,
      location: `${row.properties.city}, Mali`,
      image: row.properties.images?.[0] || '',
    } : undefined,
  }
}

export interface CreateBookingData {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  subtotal: number
  serviceFee: number
  total: number
  guestFirstName: string
  guestLastName: string
  guestEmail: string
  guestPhone: string
  specialRequests?: string
  paymentMethod?: string
}

export async function createBooking(data: CreateBookingData): Promise<{ booking: Booking | null; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { booking: null, error: 'Non connecte' }

    const { data: row, error } = await supabase.from('bookings').insert({
      property_id: data.propertyId,
      guest_id: user.id,
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests: data.guests,
      subtotal: data.subtotal,
      service_fee: data.serviceFee,
      total: data.total,
      guest_first_name: data.guestFirstName,
      guest_last_name: data.guestLastName,
      guest_email: data.guestEmail,
      guest_phone: data.guestPhone,
      special_requests: data.specialRequests || '',
      payment_method: data.paymentMethod || '',
      status: 'pending',
      payment_status: 'pending',
    }).select().single()

    if (error) return { booking: null, error: error.message }
    return { booking: mapSupabaseBooking(row), error: null }
  }

  // localStorage mode
  const booking: Booking = {
    id: `booking-${Date.now()}`,
    propertyId: data.propertyId,
    guestId: 'local-user',
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    status: 'confirmed',
    subtotal: data.subtotal,
    serviceFee: data.serviceFee,
    total: data.total,
    guestFirstName: data.guestFirstName,
    guestLastName: data.guestLastName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    specialRequests: data.specialRequests || '',
    paymentMethod: data.paymentMethod || '',
    paymentId: '',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString(),
  }

  const existing = JSON.parse(localStorage.getItem('ikasso_bookings') || '[]')
  existing.push(booking)
  localStorage.setItem('ikasso_bookings', JSON.stringify(existing))

  return { booking, error: null }
}

export async function getUserBookings(userId?: string): Promise<Booking[]> {
  const mode = getStorageMode()

  if (mode === 'supabase' && userId) {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('*, properties(title, city, country, images)')
      .eq('guest_id', userId)
      .order('created_at', { ascending: false })

    return (data || []).map(mapSupabaseBooking)
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('ikasso_bookings') || '[]')
  }
  return []
}

export async function getPropertyBookings(propertyId: string): Promise<Booking[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    return (data || []).map(mapSupabaseBooking)
  }

  if (typeof window !== 'undefined') {
    const all = JSON.parse(localStorage.getItem('ikasso_bookings') || '[]')
    return all.filter((b: any) => b.propertyId === propertyId)
  }
  return []
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status'],
  paymentStatus?: Booking['paymentStatus']
): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const updates: Record<string, any> = { status }
    if (paymentStatus) updates.payment_status = paymentStatus
    const { error } = await supabase.from('bookings').update(updates).eq('id', id)
    return { error: error?.message || null }
  }

  const existing = JSON.parse(localStorage.getItem('ikasso_bookings') || '[]')
  const idx = existing.findIndex((b: any) => b.id === id)
  if (idx >= 0) {
    existing[idx].status = status
    if (paymentStatus) existing[idx].paymentStatus = paymentStatus
    localStorage.setItem('ikasso_bookings', JSON.stringify(existing))
  }
  return { error: null }
}
