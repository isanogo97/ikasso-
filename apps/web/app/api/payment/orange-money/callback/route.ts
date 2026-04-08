import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, order_id, pay_token } = body

    if (status === 'SUCCESS' && order_id) {
      // Update booking payment status
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseUrl && serviceKey) {
          const { createAdminClient } = await import('../../../../lib/supabase/admin')
          const supabase = createAdminClient()
          // Find booking by payment reference
          await supabase.from('bookings').update({
            payment_status: 'paid',
            payment_id: pay_token || order_id,
            status: 'confirmed',
          }).eq('payment_id', order_id)
        }
      } catch (e) {
        console.error('Failed to update booking from Orange Money callback:', e)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Orange Money callback error:', error)
    return NextResponse.json({ error: 'Callback error' }, { status: 500 })
  }
}
