'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getStorageMode } from '../dal/config'

interface RealtimeIncidentState {
  newIncidentCount: number
  newMessageIncidentIds: Set<string>
  lastEvent: { type: string; data: any } | null
  resetCounts: () => void
}

export function useRealtimeIncidents(
  onNewMessage?: (incidentId: string) => void,
  onNewIncident?: () => void
): RealtimeIncidentState {
  const [newIncidentCount, setNewIncidentCount] = useState(0)
  const [newMessageIncidentIds, setNewMessageIncidentIds] = useState<Set<string>>(new Set())
  const [lastEvent, setLastEvent] = useState<{ type: string; data: any } | null>(null)
  const channelsRef = useRef<any[]>([])

  const resetCounts = useCallback(() => {
    setNewIncidentCount(0)
    setNewMessageIncidentIds(new Set())
  }, [])

  // Play notification sound
  const playNotification = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.value = 0.15
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [])

  useEffect(() => {
    if (getStorageMode() !== 'supabase') return

    let cancelled = false

    const setup = async () => {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []

      // Listen for new incidents
      const incidentChannel = supabase
        .channel('admin:incidents')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'incidents' },
          (payload: any) => {
            if (cancelled) return
            setNewIncidentCount(prev => prev + 1)
            setLastEvent({ type: 'new_incident', data: payload.new })
            playNotification()
            onNewIncident?.()
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'incidents' },
          (payload: any) => {
            if (cancelled) return
            setLastEvent({ type: 'incident_updated', data: payload.new })
          }
        )
        .subscribe()

      // Listen for new messages in incidents
      const messageChannel = supabase
        .channel('admin:incident_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'incident_messages' },
          (payload: any) => {
            if (cancelled) return
            const msg = payload.new
            // Only notify for user messages (not admin's own messages)
            if (msg.sender_type === 'user') {
              setNewMessageIncidentIds(prev => new Set(prev).add(msg.incident_id))
              setLastEvent({ type: 'new_message', data: msg })
              playNotification()
              onNewMessage?.(msg.incident_id)
            }
          }
        )
        .subscribe()

      channelsRef.current = [incidentChannel, messageChannel]
    }

    setup()

    return () => {
      cancelled = true
      import('../supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        channelsRef.current.forEach(ch => supabase.removeChannel(ch))
        channelsRef.current = []
      })
    }
  }, [onNewMessage, onNewIncident, playNotification])

  return { newIncidentCount, newMessageIncidentIds, lastEvent, resetCounts }
}
