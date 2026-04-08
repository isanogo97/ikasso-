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

// Demo conversations for localStorage mode
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participantId: 'host-1',
    participantName: 'Aminata Traore',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    propertyId: '1',
    propertyName: 'Villa Moderne a Bamako',
    lastMessage: 'Bienvenue ! N\'hesitez pas si vous avez des questions.',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    participantId: 'host-2',
    participantName: 'Oumar Coulibaly',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    propertyId: '3',
    propertyName: 'Maison Traditionnelle a Segou',
    lastMessage: 'Votre reservation est confirmee. A bientot !',
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
  },
]

const DEMO_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'host-1',
      content: 'Bonjour et bienvenue sur Ikasso ! Je suis Aminata, votre hote.',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'host-1',
      content: 'N\'hesitez pas si vous avez des questions sur la villa ou sur Bamako.',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-3',
      conversationId: 'conv-2',
      senderId: 'host-2',
      content: 'Votre reservation est confirmee. A bientot !',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
}

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
