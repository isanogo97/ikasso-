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
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString()
    const isSuperAdmin = user.adminRole === 'super_admin'

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

    const baseStats = {
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
    }

    // Super admin gets detailed financial data
    if (isSuperAdmin) {
      const commissionRate = 0.08 // 8%

      // Weekly revenue from bookings
      const weekRevenueRes = await supabase
        .from('bookings')
        .select('total')
        .eq('payment_status', 'paid')
        .gte('created_at', weekStart)
      const weekRev = (weekRevenueRes.data || []).reduce((sum: number, b: any) => sum + (b.total || 0), 0)

      // Sponsor revenues
      const [sponsorTotalRes, sponsorMonthRes, sponsorWeekRes] = await Promise.all([
        supabase.from('ad_transactions').select('amount').eq('status', 'paid'),
        supabase.from('ad_transactions').select('amount').eq('status', 'paid').gte('created_at', monthStart),
        supabase.from('ad_transactions').select('amount').eq('status', 'paid').gte('created_at', weekStart),
      ])

      const sponsorTotal = (sponsorTotalRes.data || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
      const sponsorMonth = (sponsorMonthRes.data || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
      const sponsorWeek = (sponsorWeekRes.data || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

      // Monthly evolution (last 12 months)
      const monthlyData = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const mStart = d.toISOString()
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()

        const [bookingsM, sponsorsM] = await Promise.all([
          supabase.from('bookings').select('total').eq('payment_status', 'paid')
            .gte('created_at', mStart).lt('created_at', mEnd),
          supabase.from('ad_transactions').select('amount').eq('status', 'paid')
            .gte('created_at', mStart).lt('created_at', mEnd),
        ])

        const bookingRev = (bookingsM.data || []).reduce((s: number, b: any) => s + (b.total || 0), 0)
        const sponsorRev = (sponsorsM.data || []).reduce((s: number, t: any) => s + (t.amount || 0), 0)

        monthlyData.push({
          month: d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          commissions: Math.round(bookingRev * commissionRate),
          sponsors: sponsorRev,
          bookingsTotal: bookingRev,
        })
      }

      // Top cities by bookings
      const topCitiesRes = await supabase
        .from('bookings')
        .select('property_id, properties(city)')
        .eq('payment_status', 'paid')
        .limit(500)
      const cityCounts: Record<string, number> = {}
      for (const b of (topCitiesRes.data || []) as any[]) {
        const city = b.properties?.city || 'Inconnu'
        cityCounts[city] = (cityCounts[city] || 0) + 1
      }
      const topCities = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }))

      // Recent audit log (super admin only)
      const auditRes = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Recent transactions
      const recentTransRes = await supabase
        .from('ad_transactions')
        .select('*, sponsors(business_name)')
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({
        ...baseStats,
        finance: {
          commissionRate,
          commissionsTotal: Math.round(totalRev * commissionRate),
          commissionsMonth: Math.round(monthRev * commissionRate),
          commissionsWeek: Math.round(weekRev * commissionRate),
          sponsorsTotal: sponsorTotal,
          sponsorsMonth: sponsorMonth,
          sponsorsWeek: sponsorWeek,
          caTotal: Math.round(totalRev * commissionRate) + sponsorTotal,
          caMonth: Math.round(monthRev * commissionRate) + sponsorMonth,
          caWeek: Math.round(weekRev * commissionRate) + sponsorWeek,
          monthlyEvolution: monthlyData,
          topCities,
        },
        auditLog: auditRes.data || [],
        recentTransactions: recentTransRes.data || [],
      })
    }

    return NextResponse.json(baseStats)
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
