'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '../dal/messages'
import { getStorageMode } from '../dal/config'

export function useRealtimeMessages(
  conversationId: string | null,
  userId: string | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!conversationId || !userId || getStorageMode() !== 'supabase') return

    let cancelled = false

    const setup = async () => {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      // Clean up previous channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload: any) => {
            if (cancelled) return
            const m = payload.new
            const newMsg: Message = {
              id: m.id,
              conversationId: m.conversation_id,
              senderId: m.sender_id,
              content: m.content,
              read: m.read,
              createdAt: m.created_at,
            }
            // Deduplicate by ID
            setMessages(prev => {
              if (prev.some(msg => msg.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload: any) => {
            if (cancelled) return
            const m = payload.new
            setMessages(prev =>
              prev.map(msg =>
                msg.id === m.id ? { ...msg, read: m.read } : msg
              )
            )
          }
        )
        .subscribe()

      channelRef.current = channel
    }

    setup()

    return () => {
      cancelled = true
      if (channelRef.current) {
        import('../supabase/client').then(({ createClient }) => {
          createClient().removeChannel(channelRef.current)
          channelRef.current = null
        })
      }
    }
  }, [conversationId, userId, setMessages])
}
