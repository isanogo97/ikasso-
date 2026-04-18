'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getConversations } from '../dal/messages'
import { getStorageMode } from '../dal/config'

export function useUnreadCount(userId: string | undefined): number {
  const [totalUnread, setTotalUnread] = useState(0)
  const channelsRef = useRef<any[]>([])

  const refetch = useCallback(() => {
    if (!userId) return
    getConversations(userId).then(convs => {
      setTotalUnread(convs.reduce((sum, c) => sum + c.unreadCount, 0))
    })
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    refetch()

    // Fallback polling every 30s (in case Realtime is not active)
    const pollInterval = setInterval(refetch, 30000)

    if (getStorageMode() !== 'supabase') {
      return () => clearInterval(pollInterval)
    }

    let cancelled = false

    const setup = async () => {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []

      const handleChange = () => {
        if (!cancelled) refetch()
      }

      // Listen to both INSERT and UPDATE on conversations
      const ch1 = supabase
        .channel(`unread:p1:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `participant_1=eq.${userId}`,
          },
          handleChange
        )
        .subscribe()

      const ch2 = supabase
        .channel(`unread:p2:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `participant_2=eq.${userId}`,
          },
          handleChange
        )
        .subscribe()

      channelsRef.current = [ch1, ch2]
    }

    setup()

    return () => {
      cancelled = true
      clearInterval(pollInterval)
      import('../supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        channelsRef.current.forEach(ch => supabase.removeChannel(ch))
        channelsRef.current = []
      })
    }
  }, [userId, refetch])

  return totalUnread
}
