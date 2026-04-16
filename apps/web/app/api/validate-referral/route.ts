import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { safeError } from '../../lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const { code, userId, userEmail } = await req.json()
    if (!code) return NextResponse.json({ valid: false, error: 'Code requis' })

    const supabase = createAdminClient()
    const upperCode = code.toUpperCase().trim()

    // Check if this user already used ANY code (1 code per account)
    if (userId) {
      const { data: existingRef } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', userId)
        .limit(1)
        .single()
      if (existingRef) {
        return NextResponse.json({ valid: false, error: 'Vous avez deja utilise un code sur ce compte' })
      }

      // Also check if profile already has commission_free_until set
      const { data: profile } = await supabase
        .from('profiles')
        .select('commission_free_until')
        .eq('id', userId)
        .single()
      if (profile?.commission_free_until && new Date(profile.commission_free_until) > new Date()) {
        return NextResponse.json({ valid: false, error: 'Un code est deja actif sur ce compte' })
      }
    }

    // Check referral_codes table first (host-to-host referral)
    const { data: refCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .single()

    if (refCode) {
      if (refCode.max_referrals && refCode.current_referrals >= refCode.max_referrals) {
        return NextResponse.json({ valid: false, error: 'Ce code a atteint le nombre max d\'utilisations' })
      }

      const commissionFreeUntil = new Date()
      commissionFreeUntil.setMonth(commissionFreeUntil.getMonth() + (refCode.reward_months || 3))

      // Create referral entry
      if (userId) {
        await supabase.from('referrals').insert({
          referral_code_id: refCode.id,
          referrer_id: refCode.host_id,
          referred_id: userId,
          referred_email: userEmail || null,
          status: 'active',
          commission_free_until: commissionFreeUntil.toISOString(),
        })

        // Increment usage
        await supabase.from('referral_codes').update({
          current_referrals: (refCode.current_referrals || 0) + 1,
        }).eq('id', refCode.id)

        // Update user profile with commission-free period
        await supabase.from('profiles').update({
          commission_free_until: commissionFreeUntil.toISOString(),
        }).eq('id', userId)
      }

      return NextResponse.json({
        valid: true,
        type: 'referral',
        reward: `Commission 0% pendant ${refCode.reward_months || 3} mois`,
        months: refCode.reward_months || 3,
      })
    }

    // Check promo_codes table (general promo codes like WELCOMEIKASSO)
    const { data: promoCode } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .single()

    if (promoCode) {
      if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
        return NextResponse.json({ valid: false, error: 'Ce code a atteint le nombre max d\'utilisations' })
      }
      if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
        return NextResponse.json({ valid: false, error: 'Ce code a expire' })
      }

      // Check target_type (hote/client/all)
      if (promoCode.target_type && promoCode.target_type !== 'all' && userId) {
        const { data: userProfile } = await supabase.from('profiles').select('user_type').eq('id', userId).single()
        if (userProfile && userProfile.user_type !== promoCode.target_type) {
          const label = promoCode.target_type === 'hote' ? 'les hotes' : 'les clients'
          return NextResponse.json({ valid: false, error: `Ce code est reserve aux ${label}` })
        }
      }

      // Check target_emails (specific people only)
      if (promoCode.target_emails && promoCode.target_emails.length > 0) {
        const lowerEmail = (userEmail || '').toLowerCase()
        if (!lowerEmail || !promoCode.target_emails.includes(lowerEmail)) {
          return NextResponse.json({ valid: false, error: 'Ce code n\'est pas disponible pour votre compte' })
        }
      }

      // Increment usage
      await supabase.from('promo_codes').update({
        current_uses: (promoCode.current_uses || 0) + 1,
      }).eq('id', promoCode.id)

      // If it grants commission-free period (description contains "commission" or discount_percent = 100)
      const isCommissionFree = promoCode.discount_percent === 100 || (promoCode.description && promoCode.description.toLowerCase().includes('commission'))

      if (isCommissionFree && userId) {
        const months = 3 // Default 3 months for promo codes
        const commissionFreeUntil = new Date()
        commissionFreeUntil.setMonth(commissionFreeUntil.getMonth() + months)

        await supabase.from('profiles').update({
          commission_free_until: commissionFreeUntil.toISOString(),
        }).eq('id', userId)
      }

      return NextResponse.json({
        valid: true,
        type: 'promo',
        reward: promoCode.discount_percent
          ? `-${promoCode.discount_percent}% ${isCommissionFree ? 'de commission pendant 3 mois' : ''}`
          : promoCode.discount_amount
            ? `-${promoCode.discount_amount} FCFA`
            : 'Code valide',
      })
    }

    return NextResponse.json({ valid: false, error: 'Code invalide' })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: safeError(err) })
  }
}
