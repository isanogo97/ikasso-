import { getStorageMode } from './config'

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  propertyId?: string
  propertyName?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
}

// No demo data — empty until real conversations happen via Supabase
const DEMO_CONVERSATIONS: Conversation[] = []
const DEMO_MESSAGES: Record<string, Message[]> = {}

export async function getConversations(userId?: string): Promise<Conversation[]> {
  const mode = getStorageMode()

  if (mode === 'supabase' && userId) {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('conversations')
      .select('*, p1:profiles!conversations_participant_1_fkey(first_name, last_name, avatar_url), p2:profiles!conversations_participant_2_fkey(first_name, last_name, avatar_url), properties(title)')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    return (data || []).map((c: any) => {
      const isP1 = c.participant_1 === userId
      const other = isP1 ? c.p2 : c.p1
      return {
        id: c.id,
        participantId: isP1 ? c.participant_2 : c.participant_1,
        participantName: other ? `${other.first_name} ${other.last_name}` : 'Utilisateur',
        participantAvatar: other?.avatar_url || '',
        propertyId: c.property_id,
        propertyName: c.properties?.title,
        lastMessage: c.last_message || '',
        lastMessageAt: c.last_message_at,
        unreadCount: isP1 ? c.unread_count_1 : c.unread_count_2,
      }
    })
  }

  return DEMO_CONVERSATIONS
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    return (data || []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.content,
      read: m.read,
      createdAt: m.created_at,
    }))
  }

  return DEMO_MESSAGES[conversationId] || []
}

export async function sendMessage(conversationId: string, content: string): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecte' }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    return { error: error?.message || null }
  }

  // Demo mode — just add to local array
  return { error: null }
}
