import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAdmin, safeError } from '../../../../lib/api-auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const body = await req.json().catch(() => ({}))

    // Save user info before deletion for audit log
    const { data: profile } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', userId).single()

    // First: ban the user to invalidate all their sessions immediately
    try {
      await supabase.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
    } catch {}

    // Then delete from auth.users (cascades to profiles, verifications, etc.)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Delete user error:', error)
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    // Log deletion in audit table
    try {
      await supabase.from('audit_log').insert({
        action: 'user_deleted',
        target_type: 'user',
        target_id: userId,
        target_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null,
        target_email: profile?.email || null,
        performed_by: (body as any)?.adminName || 'Admin',
      })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete user error:', err)
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const userId = params.id
    const body = await req.json()
    const { status, identity_verified } = body

    const supabase = createAdminClient()
    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (identity_verified !== undefined) updates.identity_verified = identity_verified

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    // Ban/unban at Supabase Auth level to force session invalidation
    if (status === 'suspended') {
      await supabase.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
    } else if (status === 'active') {
      await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
