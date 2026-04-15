'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Search, Send, Mail } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { getConversations, getMessages, sendMessage } from '../lib/dal'
import type { Conversation, Message } from '../lib/dal'

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getConversations(user.id).then(c => {
      setConversations(c)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!selectedId) return
    getMessages(selectedId).then(setMessages)
  }, [selectedId])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId) return
    await sendMessage(selectedId, newMessage.trim())
    setNewMessage('')
    // Refresh messages
    const updated = await getMessages(selectedId)
    setMessages(updated)
  }

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connectez-vous</h2>
          <p className="text-sm text-gray-500 mb-6">Vous devez etre connecte pour voir vos messages.</p>
          <Link href="/auth/login" className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm">Se connecter</Link>
        </div>
      </div>
    )
  }

  // Empty state — no conversations
  if (conversations.length === 0 && !selectedId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600 lg:hidden" />
              <Logo size="sm" />
            </Link>
            <h1 className="font-semibold text-gray-900">Messages</h1>
            <div className="w-8" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Vos conversations avec les hotes apparaitront ici lorsque vous effectuerez une reservation.
            </p>

            <a
              href="mailto:support@ikasso.ml"
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-primary-200 transition-all mb-6 text-left"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white flex-shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Service Client Ikasso</p>
                <p className="text-xs text-gray-500 mt-0.5">Besoin d&apos;aide ? Contactez notre equipe</p>
              </div>
            </a>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-500/25"
            >
              <Search className="h-4 w-4" />
              Rechercher un logement
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Conversations list + chat view
  const selectedConv = conversations.find(c => c.id === selectedId)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-gray-600 lg:hidden" />
            <Logo size="sm" />
          </Link>
          <h1 className="font-semibold text-gray-900">Messages</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full flex">
        {/* Conversation list */}
        <div className={`w-full lg:w-80 lg:border-r border-gray-200 bg-white ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedId === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {conv.participantName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 truncate">{conv.participantName}</span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'Nouvelle conversation'}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {selectedId && selectedConv ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setSelectedId(null)} className="lg:hidden p-1">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                {selectedConv.participantName?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{selectedConv.participantName}</p>
                {selectedConv.propertyName && (
                  <p className="text-[11px] text-gray-400">{selectedConv.propertyName}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">Aucun message. Commencez la conversation !</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ecrire un message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-xl transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Selectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
