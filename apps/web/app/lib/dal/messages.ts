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

export async function startConversation(
  currentUserId: string,
  hostId: string,
  propertyId: string,
  initialMessage: string
): Promise<{ conversationId: string | null; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()

    // Check if conversation already exists between these users for this property
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .or(`and(participant_1.eq.${currentUserId},participant_2.eq.${hostId}),and(participant_1.eq.${hostId},participant_2.eq.${currentUserId})`)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_1: currentUserId,
          participant_2: hostId,
          property_id: propertyId,
          last_message: initialMessage,
          last_message_at: new Date().toISOString(),
          unread_count_1: 0,
          unread_count_2: 1,
        })
        .select('id')
        .single()

      if (convError) return { conversationId: null, error: convError.message }
      conversationId = newConv.id
    }

    // Send the initial message
    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: initialMessage,
    })

    if (msgError) return { conversationId, error: msgError.message }

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message: initialMessage,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return { conversationId, error: null }
  }

  return { conversationId: null, error: null }
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()

    // Determine if user is participant_1 or participant_2
    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', conversationId)
      .single()

    if (!conv) return

    const unreadField = conv.participant_1 === userId ? 'unread_count_1' : 'unread_count_2'

    // Reset unread count
    await supabase
      .from('conversations')
      .update({ [unreadField]: 0 })
      .eq('id', conversationId)

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false)
  }
}
