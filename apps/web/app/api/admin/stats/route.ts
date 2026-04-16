import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin, safeError } from '../../../lib/api-auth'

export async function GET(req: NextRequest) {
  const { user, error } = await requireAdmin(req)
  if (error) return error

  try {
    const supabase = createAdminClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      usersRes, hostsRes, clientsRes, suspendedRes, activeRes, verifiedRes,
      pendingVerifRes, approvedVerifRes, rejectedVerifRes,
      activePropsRes, pendingPropsRes,
      totalBookingsRes, paidBookingsRes, revenueRes, monthRevenueRes,
      openIncidentsRes, sponsorsRes, deletedUsersRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'hote'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'client'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('identity_verified', true),
      supabase.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      supabase.from('bookings').select('total').eq('payment_status', 'paid'),
      supabase.from('bookings').select('total').eq('payment_status', 'paid').gte('created_at', monthStart),
      supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('sponsors').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('audit_log').select('id', { count: 'exact', head: true }).eq('action', 'user_deleted'),
    ])

    const totalRev = (revenueRes.data || []).reduce((sum: number, b: any) => sum + (b.total || 0), 0)
    const monthRev = (monthRevenueRes.data || []).reduce((sum: number, b: any) => sum + (b.total || 0), 0)

    return NextResponse.json({
      totalUsers: usersRes.count ?? 0,
      totalHosts: hostsRes.count ?? 0,
      totalClients: clientsRes.count ?? 0,
      pendingVerifications: pendingVerifRes.count ?? 0,
      approvedVerifications: approvedVerifRes.count ?? 0,
      rejectedVerifications: rejectedVerifRes.count ?? 0,
      activeProperties: activePropsRes.count ?? 0,
      pendingProperties: pendingPropsRes.count ?? 0,
      suspendedUsers: suspendedRes.count ?? 0,
      activeUsers: activeRes.count ?? 0,
      verifiedUsers: verifiedRes.count ?? 0,
      totalBookings: totalBookingsRes.count ?? 0,
      paidBookings: paidBookingsRes.count ?? 0,
      totalRevenue: totalRev,
      monthRevenue: monthRev,
      openIncidents: (openIncidentsRes as any).count ?? 0,
      activeSponsors: (sponsorsRes as any).count ?? 0,
      deletedUsers: (deletedUsersRes as any).count ?? 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
