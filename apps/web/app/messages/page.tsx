'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, Search, MoreVertical, Phone, Video, ArrowLeft, MessageCircle, Clock, Check, CheckCheck } from 'lucide-react'
import Logo from '../components/Logo'

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  read: boolean
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  propertyTitle?: string
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // DonnÃ©es de dÃ©monstration
  const conversations: Conversation[] = [
    {
      id: '1',
      participantId: 'fatou-keita',
      participantName: 'Fatou Keita',
      participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Merci pour votre rÃ©servation ! Je vous enverrai les dÃ©tails d\'accÃ¨s demain.',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      unreadCount: 2,
      isOnline: true,
      propertyTitle: 'Villa Moderne Ã  Bamako'
    },
    {
      id: '2',
      participantId: 'ibrahim-traore',
      participantName: 'Ibrahim TraorÃ©',
      participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'L\'appartement est-il disponible pour le week-end prochain ?',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      unreadCount: 0,
      isOnline: false,
      propertyTitle: 'Appartement Centre-ville SÃ©gou'
    },
    {
      id: '3',
      participantId: 'aminata-kone',
      participantName: 'Aminata KonÃ©',
      participantAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Parfait ! Ã€ bientÃ´t alors.',
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      unreadCount: 0,
      isOnline: true,
      propertyTitle: 'Maison Traditionnelle Dogon'
    },
    {
      id: '4',
      participantId: 'support-ikasso',
      participantName: 'Support Ikasso',
      participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Votre problÃ¨me a Ã©tÃ© rÃ©solu. N\'hÃ©sitez pas si vous avez d\'autres questions !',
      lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      unreadCount: 0,
      isOnline: true
    }
  ]

  const messages: { [key: string]: Message[] } = {
    '1': [
      {
        id: '1',
        senderId: 'fatou-keita',
        senderName: 'Fatou Keita',
        content: 'Bonjour Amadou ! Merci pour votre rÃ©servation de la Villa Moderne Ã  Bamako.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      },
      {
        id: '2',
        senderId: 'amadou-diallo',
        senderName: 'Amadou Diallo',
        content: 'Bonjour Fatou ! Je suis trÃ¨s excitÃ© pour ce sÃ©jour. Pouvez-vous me donner quelques informations sur le quartier ?',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        read: true
      },
      {
        id: '3',
        senderId: 'fatou-keita',
        senderName: 'Fatou Keita',
        content: 'Bien sÃ»r ! La villa se trouve dans le quartier du Fleuve, trÃ¨s calme et sÃ©curisÃ©. Il y a un supermarchÃ© Ã  5 minutes Ã  pied et plusieurs restaurants excellents.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true
      },
      {
        id: '4',
        senderId: 'amadou-diallo',
        senderName: 'Amadou Diallo',
        content: 'Parfait ! Et pour le transport depuis l\'aÃ©roport ?',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true
      },
      {
        id: '5',
        senderId: 'fatou-keita',
        senderName: 'Fatou Keita',
        content: 'Je peux vous recommander un taxi de confiance. Comptez environ 15 000 FCFA depuis l\'aÃ©roport Modibo Keita.',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        read: true
      },
      {
        id: '6',
        senderId: 'fatou-keita',
        senderName: 'Fatou Keita',
        content: 'Merci pour votre rÃ©servation ! Je vous enverrai les dÃ©tails d\'accÃ¨s demain.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      }
    ],
    '2': [
      {
        id: '1',
        senderId: 'ibrahim-traore',
        senderName: 'Ibrahim TraorÃ©',
        content: 'Bonjour, j\'aimerais rÃ©server votre appartement Ã  SÃ©gou.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true
      },
      {
        id: '2',
        senderId: 'ibrahim-traore',
        senderName: 'Ibrahim TraorÃ©',
        content: 'L\'appartement est-il disponible pour le week-end prochain ?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      }
    ]
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.propertyTitle && conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const conversationMessages = selectedConversation ? messages[selectedConversation] || [] : []

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Simulation d'envoi de message
      alert(`Message envoyÃ© : "${newMessage}"\n\nEn mode dÃ©mo, le message serait ajoutÃ© Ã  la conversation.`)
      setNewMessage('')
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}min`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days}j`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600">Tableau de bord</Link>
              <Link href="/help" className="text-gray-600 hover:text-primary-600">Aide</Link>
              <div className="flex items-center space-x-2">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
                  alt="Amadou Diallo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-700 font-medium">Amadou Diallo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                  <MessageCircle className="h-6 w-6 text-primary-600" />
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une conversation..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Image
                          src={conversation.participantAvatar}
                          alt={conversation.participantName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {conversation.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.participantName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {conversation.propertyTitle && (
                          <p className="text-xs text-primary-600 mb-1 truncate">
                            {conversation.propertyTitle}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={selectedConv.participantAvatar}
                            alt={selectedConv.participantName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {selectedConv.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h2 className="font-medium text-gray-900">{selectedConv.participantName}</h2>
                          <p className="text-sm text-gray-500">
                            {selectedConv.isOnline ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => alert('Appel vocal simulÃ© avec ' + selectedConv.participantName)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => alert('Appel vidÃ©o simulÃ© avec ' + selectedConv.participantName)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Video className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {selectedConv.propertyTitle && (
                      <div className="mt-3 p-2 bg-primary-50 rounded-lg">
                        <p className="text-sm text-primary-700">
                          <strong>PropriÃ©tÃ© :</strong> {selectedConv.propertyTitle}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages.map((message) => {
                      const isCurrentUser = message.senderId === 'amadou-diallo'
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isCurrentUser ? 'text-primary-200' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {message.timestamp.toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {isCurrentUser && (
                                message.read ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Tapez votre message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      SÃ©lectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une conversation dans la liste pour commencer Ã  discuter
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to dashboard */}
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

