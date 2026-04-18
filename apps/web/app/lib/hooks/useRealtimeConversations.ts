'use client'

import { useEffect, useRef } from 'react'
import type { Conversation } from '../dal/messages'
import { getConversations } from '../dal/messages'
import { getStorageMode } from '../dal/config'

export function useRealtimeConversations(
  userId: string | undefined,
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
  const channelsRef = useRef<any[]>([])

  useEffect(() => {
    if (!userId || getStorageMode() !== 'supabase') return

    let cancelled = false

    const setup = async () => {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      // Clean up previous channels
      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []

      const refetch = () => {
        if (cancelled) return
        getConversations(userId).then(c => {
          if (!cancelled) setConversations(c)
        })
      }

      // Supabase Realtime filter only supports single-column eq,
      // so we use two channels for participant_1 and participant_2
      const ch1 = supabase
        .channel(`conversations:p1:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `participant_1=eq.${userId}`,
          },
          refetch
        )
        .subscribe()

      const ch2 = supabase
        .channel(`conversations:p2:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
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
  }, [userId, setConversations])
}
