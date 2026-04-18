'use client'

import { useEffect, useRef, useState } from 'react'
import { getConversations } from '../dal/messages'
import { getStorageMode } from '../dal/config'

export function useUnreadCount(userId: string | undefined): number {
  const [totalUnread, setTotalUnread] = useState(0)
  const channelsRef = useRef<any[]>([])

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    getConversations(userId).then(convs => {
      setTotalUnread(convs.reduce((sum, c) => sum + c.unreadCount, 0))
    })

    if (getStorageMode() !== 'supabase') return

    let cancelled = false

    const setup = async () => {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []

      const refetch = () => {
        if (cancelled) return
        getConversations(userId).then(convs => {
          if (!cancelled) {
            setTotalUnread(convs.reduce((sum, c) => sum + c.unreadCount, 0))
          }
        })
      }

      const ch1 = supabase
        .channel(`unread:p1:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `participant_1=eq.${userId}`,
          },
          refetch
        )
        .subscribe()

      const ch2 = supabase
        .channel(`unread:p2:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `participant_2=eq.${userId}`,
          },
          refetch
        )
        .subscribe()

      channelsRef.current = [ch1, ch2]
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
  }, [userId])

  return totalUnread
}
