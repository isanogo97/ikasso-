'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getStorageMode } from '../dal/config'

interface PresenceState {
  isOtherOnline: boolean
  isOtherTyping: boolean
  setTyping: (typing: boolean) => void
}

export function usePresence(
  conversationId: string | null,
  userId: string | undefined
): PresenceState {
  const [isOtherOnline, setIsOtherOnline] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const channelRef = useRef<any>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setTyping = useCallback((typing: boolean) => {
    if (!channelRef.current || !userId) return

    channelRef.current.track({ userId, typing })

    // Auto-reset typing after 3s
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.track({ userId, typing: false })
      }, 3000)
    }
  }, [userId])

  useEffect(() => {
    if (!conversationId || !userId || getStorageMode() !== 'supabase') return

    let cancelled = false

    const setup = async () => {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel = supabase.channel(`presence:${conversationId}`, {
        config: { presence: { key: userId } },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          if (cancelled) return
          const state = channel.presenceState()
          let otherOnline = false
          let otherTyping = false

          for (const [key, presences] of Object.entries(state)) {
            if (key !== userId && Array.isArray(presences)) {
              otherOnline = true
              otherTyping = (presences as any[]).some((p: any) => p.typing === true)
            }
          }

          setIsOtherOnline(otherOnline)
          setIsOtherTyping(otherTyping)
        })
        .on('presence', { event: 'join' }, ({ key }: any) => {
          if (cancelled || key === userId) return
          setIsOtherOnline(true)
        })
        .on('presence', { event: 'leave' }, ({ key }: any) => {
          if (cancelled || key === userId) return
          setIsOtherOnline(false)
          setIsOtherTyping(false)
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ userId, typing: false })
          }
        })

      channelRef.current = channel
    }

    setup()

    return () => {
      cancelled = true
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (channelRef.current) {
        import('../supabase/client').then(({ createClient }) => {
          createClient().removeChannel(channelRef.current)
          channelRef.current = null
        })
      }
    }
  }, [conversationId, userId])

  return { isOtherOnline, isOtherTyping, setTyping }
}
