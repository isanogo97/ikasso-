import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['SUCCESS', 'FAILED', 'CANCELLED', 'PENDING'] as const

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  try {
    const body = await request.json()
    const { status, order_id, pay_token, amount, currency } = body

    // Log the callback for audit purposes
    console.log('[Orange Money Callback]', JSON.stringify({
      timestamp: new Date().toISOString(),
      ip,
      status,
      order_id: order_id || 'missing',
      pay_token: pay_token ? '***' : 'missing',
      amount,
      currency,
    }))

    // Validate required fields
    if (!order_id || typeof order_id !== 'string') {
      console.warn('[Orange Money Callback] Missing or invalid order_id from IP:', ip)
      return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 })
    }

    // Validate status is one of expected values
    if (!status || !VALID_STATUSES.includes(status)) {
      console.warn('[Orange Money Callback] Invalid status:', status, 'from IP:', ip)
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Only process successful payments
    if (status === 'SUCCESS') {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseUrl && serviceKey) {
          const { createAdminClient } = await import('../../../../lib/supabase/admin')
          const supabase = createAdminClient()

          // Validate that the order_id exists in our bookings table before updating
          const { data: existingBooking, error: lookupError } = await supabase
            .from('bookings')
            .select('id, payment_status')
            .eq('payment_id', order_id)
            .single()

          if (lookupError || !existingBooking) {
            console.warn('[Orange Money Callback] No booking found for order_id:', order_id, 'from IP:', ip)
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
          }

          // Prevent double-processing already paid bookings
          if (existingBooking.payment_status === 'paid') {
            console.log('[Orange Money Callback] Booking already paid, skipping:', order_id)
            return NextResponse.json({ received: true, already_processed: true })
          }

          // Update booking payment status
          const { error: updateError } = await supabase.from('bookings').update({
            payment_status: 'paid',
            payment_id: pay_token || order_id,
            status: 'confirmed',
          }).eq('payment_id', order_id)

          if (updateError) {
            console.error('[Orange Money Callback] Failed to update booking:', updateError)
            return NextResponse.json({ error: 'Update failed' }, { status: 500 })
          }

          console.log('[Orange Money Callback] Successfully processed payment for booking:', existingBooking.id)
        }
      } catch (e) {
        console.error('[Orange Money Callback] Failed to update booking from callback:', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Orange Money Callback] Parse error from IP:', ip, error)
    return NextResponse.json({ error: 'Callback error' }, { status: 500 })
  }
}
