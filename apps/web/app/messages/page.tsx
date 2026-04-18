'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send,
  Mail,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Plus,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { getConversations, getMessages, sendMessage, markAsRead } from '../lib/dal'
import type { Conversation, Message } from '../lib/dal'
import { useRealtimeMessages } from '../lib/hooks/useRealtimeMessages'
import { useRealtimeConversations } from '../lib/hooks/useRealtimeConversations'
import { usePresence } from '../lib/hooks/usePresence'

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Presence for typing indicators and online status
  const { isOtherOnline, isOtherTyping, setTyping } = usePresence(selectedId, user?.id)

  // Load conversations initially
  useEffect(() => {
    if (!user) return
    getConversations(user.id).then(c => {
      setConversations(c)
      setLoading(false)
    })
  }, [user])

  // Realtime subscription for conversation list updates
  useRealtimeConversations(user?.id, setConversations)

  // Load messages when conversation selected + mark as read
  useEffect(() => {
    if (!selectedId || !user) return
    getMessages(selectedId).then(msgs => {
      setMessages(msgs)
      markAsRead(selectedId, user.id)
    })
  }, [selectedId, user])

  // Realtime subscription for new messages
  useRealtimeMessages(selectedId, user?.id, setMessages)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedId) return
    const content = newMessage.trim()
    setNewMessage('')
    setTyping(false)
    await sendMessage(selectedId, content)
    // No manual refetch — Realtime subscription delivers the new message
  }, [newMessage, selectedId, setTyping])

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedId(id)
    setMobileShowChat(true)
  }, [])

  const handleBackToList = useCallback(() => {
    setMobileShowChat(false)
  }, [])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "A l'instant"
    if (diffMin < 60) return `Il y a ${diffMin}min`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `Il y a ${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `Il y a ${diffD}j`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const formatDateSeparator = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()
    if (isToday) return "Aujourd'hui"
    if (isYesterday) return 'Hier'
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name[0]?.toUpperCase() || '?'
  }

  const filteredConversations = conversations.filter(c =>
    c.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-primary-500" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connectez-vous</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Vous devez etre connecte pour acceder a vos messages.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-500/25"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  // Empty state - no conversations
  if (conversations.length === 0 && !selectedId) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 flex-shrink-0">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <ArrowLeft className="h-5 w-5 text-gray-400 lg:hidden" />
              <Logo size="sm" />
            </Link>
            <h1 className="font-bold text-gray-900 text-lg">Messages</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-12 w-12 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune conversation</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Vos conversations apparaitront ici lorsque vous effectuerez une reservation ou contacterez un hote.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:support@ikasso.ml"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-primary-200 transition-all text-left group"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Contacter le support</p>
                  <p className="text-xs text-gray-500 mt-0.5">Notre equipe est la pour vous aider</p>
                </div>
              </a>

              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-500/25 w-full"
              >
                <Search className="h-4 w-4" />
                Rechercher un logement
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main chat layout
  const selectedConv = conversations.find(c => c.id === selectedId)

  // Group messages by date for separators
  const groupedMessages: { date: string; messages: Message[] }[] = []
  messages.forEach(msg => {
    const dateKey = new Date(msg.createdAt).toDateString()
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] })
    }
  })

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversation List */}
        <div
          className={`w-full md:w-[320px] lg:w-[360px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Left Panel Header */}
          <div className="flex-shrink-0 px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Logo size="sm" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              </div>
              <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-200 transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-400">Aucune conversation trouvee</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = selectedId === conv.id
                const isSupport = conv.participantName?.toLowerCase().includes('support') ||
                  conv.participantName?.toLowerCase().includes('ikasso')
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all relative ${
                      isActive
                        ? 'bg-primary-50/70 border-l-[3px] border-l-primary-500'
                        : 'border-l-[3px] border-l-transparent hover:bg-gray-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          isActive
                            ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                            : 'bg-gradient-to-br from-primary-400 to-primary-600'
                        }`}
                      >
                        {getInitials(conv.participantName)}
                      </div>
                      {/* Online indicator */}
                      {(selectedId === conv.id ? isOtherOnline : false) && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-sm truncate ${
                            conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'
                          }`}
                        >
                          {conv.participantName}
                        </span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs truncate ${
                            conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                          }`}
                        >
                          {conv.lastMessage || 'Nouvelle conversation'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-white min-w-0 ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedId && selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>

                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                      {getInitials(selectedConv.participantName)}
                    </div>
                    {isOtherOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {selectedConv.participantName}
                    </p>
                    <p className={`text-xs font-medium ${isOtherOnline ? 'text-green-600' : 'text-gray-400'}`}>
                      {isOtherOnline ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="h-[18px] w-[18px] text-gray-500" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Video className="h-[18px] w-[18px] text-gray-500" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-[18px] w-[18px] text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">
                        Aucun message. Commencez la conversation !
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {groupedMessages.map(group => (
                      <div key={group.date}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 bg-white rounded-full text-[11px] text-gray-500 font-medium shadow-sm border border-gray-100">
                            {formatDateSeparator(group.messages[0].createdAt)}
                          </span>
                        </div>

                        {/* Messages in group */}
                        <div className="space-y-1.5">
                          {group.messages.map((msg, idx) => {
                            const isMe = msg.senderId === user.id
                            const prevMsg = idx > 0 ? group.messages[idx - 1] : null
                            const showTail = !prevMsg || prevMsg.senderId !== msg.senderId

                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${
                                  showTail ? 'mt-2' : ''
                                }`}
                              >
                                <div
                                  className={`max-w-[70%] lg:max-w-[55%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                    isMe
                                      ? `bg-gradient-to-br from-primary-500 to-primary-600 text-white ${
                                          showTail ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-br-md'
                                        }`
                                      : `bg-white text-gray-800 border border-gray-100 ${
                                          showTail ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-bl-md'
                                        }`
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                  <p
                                    className={`text-[10px] mt-1.5 text-right ${
                                      isMe ? 'text-white/60' : 'text-gray-400'
                                    }`}
                                  >
                                    {formatTime(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isOtherTyping && (
                      <div className="flex justify-start mt-2">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-100 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                    <Paperclip className="h-5 w-5 text-gray-400" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ecrire un message..."
                      value={newMessage}
                      onChange={e => {
                        setNewMessage(e.target.value)
                        if (e.target.value.trim()) setTyping(true)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-200 transition-all pr-10"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Smile className="h-5 w-5 text-gray-400 hover:text-gray-500 transition-colors" />
                    </button>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-all flex-shrink-0 shadow-sm hover:shadow-md disabled:shadow-none"
                  >
                    <Send className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected (desktop) */
            <div className="h-full flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-5">
                  <MessageCircle className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Vos messages
                </h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Selectionnez une conversation pour commencer a discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
