import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAuth, safeError } from '../../../lib/api-auth'

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req)
  if (error) return error

  try {
    const supabase = createAdminClient()

    // Delete user data in order (respecting foreign keys)
    // Messages, conversations, bookings, reviews, properties, verifications, incidents
    await supabase.from('messages').delete().eq('sender_id', user.id)
    await supabase.from('conversations').delete().or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    await supabase.from('reviews').delete().eq('guest_id', user.id)
    await supabase.from('bookings').delete().eq('guest_id', user.id)
    await supabase.from('properties').delete().eq('host_id', user.id)
    await supabase.from('identity_verifications').delete().eq('user_id', user.id)
    await supabase.from('incident_messages').delete().in(
      'incident_id',
      (await supabase.from('incidents').select('id').eq('user_id', user.id)).data?.map((i: any) => i.id) || []
    )
    await supabase.from('incidents').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
    if (authError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Compte supprime avec succes' })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
