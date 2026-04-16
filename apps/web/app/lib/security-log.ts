import { createAdminClient } from './supabase/admin'

export type SecurityEvent =
  | 'login_failed'
  | 'login_success'
  | 'admin_action'
  | 'unauthorized_access'
  | 'rate_limited'
  | 'suspicious_activity'

export async function logSecurityEvent(event: {
  action: SecurityEvent
  ip?: string
  userId?: string
  details?: string
  path?: string
}) {
  try {
    const supabase = createAdminClient()
    await supabase.from('audit_log').insert({
      action: event.action,
      target_type: 'security',
      target_id: event.userId || null,
      target_name: event.ip || null,
      target_email: event.path || null,
      details: event.details ? { message: event.details } : null,
      performed_by: 'system',
    })
  } catch {
    // Non-blocking - don't crash the app if logging fails
    console.error('Security log failed:', event)
  }
}
