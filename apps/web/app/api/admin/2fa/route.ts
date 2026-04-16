import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api-auth'
import { generateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'

// GET: generate TOTP secret + QR code
export async function GET(req: NextRequest) {
  const { user, error } = await requireAdmin(req)
  if (error) return error

  const supabase = createAdminClient()

  // Check if already enabled
  const { data: admin } = await supabase
    .from('admin_users')
    .select('totp_enabled, totp_secret')
    .eq('user_id', user.id)
    .single()

  if (admin?.totp_enabled) {
    return NextResponse.json({ enabled: true })
  }

  // Generate new secret
  const secret = generateSecret()
  const otpauth = generateURI({ issuer: 'Ikasso Admin', label: user.email || 'admin', secret })
  const qrCode = await QRCode.toDataURL(otpauth)

  // Save secret (not yet enabled)
  await supabase
    .from('admin_users')
    .update({ totp_secret: secret })
    .eq('user_id', user.id)

  return NextResponse.json({ secret, qrCode, enabled: false })
}

// POST: verify TOTP code and enable 2FA
export async function POST(req: NextRequest) {
  const { user, error } = await requireAdmin(req)
  if (error) return error

  const { code, action } = await req.json()
  const supabase = createAdminClient()

  const { data: admin } = await supabase
    .from('admin_users')
    .select('totp_secret, totp_enabled')
    .eq('user_id', user.id)
    .single()

  if (!admin?.totp_secret) {
    return NextResponse.json({ error: 'Configurez d\'abord le 2FA' }, { status: 400 })
  }

  // Verify code
  const isValid = verify({ token: code, secret: admin.totp_secret })

  if (!isValid) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 401 })
  }

  if (action === 'enable') {
    await supabase
      .from('admin_users')
      .update({ totp_enabled: true })
      .eq('user_id', user.id)
    return NextResponse.json({ success: true, message: '2FA active' })
  }

  if (action === 'disable') {
    await supabase
      .from('admin_users')
      .update({ totp_enabled: false, totp_secret: null })
      .eq('user_id', user.id)
    return NextResponse.json({ success: true, message: '2FA desactive' })
  }

  // Just verify (for login)
  return NextResponse.json({ valid: true })
}
