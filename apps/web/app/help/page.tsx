'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, MessageCircle, Phone, Mail, ChevronDown, ChevronRight,
  ArrowLeft, HelpCircle, Users, CreditCard, Home, Shield, Book,
  Send, Minimize2, X, Headphones, Clock, CheckCircle2, Star,
  MapPin, Key, AlertCircle
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { authFetch } from '../lib/auth-fetch'

/* ------------------------------------------------------------------ */
/*  Live Chat Widget                                                   */
/* ------------------------------------------------------------------ */
function LiveChatWidget({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [incidentId, setIncidentId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [anonName, setAnonName] = useState('')
  const [anonEmail, setAnonEmail] = useState('')
  const [anonMessage, setAnonMessage] = useState('')
  const [anonSent, setAnonSent] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [adminTyping, setAdminTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevMsgCountRef = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, adminTyping])

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await authFetch('/api/live-chat')
      const data = await res.json()
      if (data.messages) {
        // Detect if admin just sent a new message (typing indicator)
        const newCount = data.messages.length
        const lastMsg = data.messages[newCount - 1]
        if (newCount > prevMsgCountRef.current && lastMsg?.sender_type === 'admin') {
          setAdminTyping(false)
        }
        prevMsgCountRef.current = newCount
        setMessages(data.messages)
      }
      if (data.incidentId) setIncidentId(data.incidentId)
    } catch {}
  }, [isAuthenticated])

  useEffect(() => {
    if (!open) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    if (isAuthenticated) {
      setLoadingHistory(true)
      fetchHistory().finally(() => setLoadingHistory(false))
      intervalRef.current = setInterval(fetchHistory, 5000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [open, isAuthenticated, fetchHistory])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    // Show admin typing after user sends a message
    setAdminTyping(true)
    try {
      const res = await authFetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, incidentId }),
      })
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        prevMsgCountRef.current = data.messages.length
      }
      if (data.incidentId) setIncidentId(data.incidentId)
    } catch {}
    setSending(false)
    // Auto-hide typing after 10s if no admin response
    setTimeout(() => setAdminTyping(false), 10000)
  }

  const handleAnonSend = async () => {
    const text = anonMessage.trim()
    if (!text || sending) return
    setSending(true)
    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, name: anonName, email: anonEmail }),
      })
      setAnonSent(true)
    } catch {}
    setSending(false)
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-bounce-slow"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="h-5 w-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-600" />
              </div>
              <div>
                <p className="font-bold text-sm">Support Ikasso</p>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  En ligne - Repond en ~5 min
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isAuthenticated ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                {loadingHistory && messages.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-primary-500" />
                  </div>
                )}
                {!loadingHistory && messages.length === 0 && (
                  <div className="text-center py-8 px-2">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-primary-500" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">Bienvenue !</p>
                    <p className="text-sm text-gray-500">Comment pouvons-nous vous aider aujourd'hui ?</p>
                  </div>
                )}
                {messages.map((msg: any) => {
                  const isUser = msg.sender_type === 'user'
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                          <Headphones className="h-3.5 w-3.5 text-primary-600" />
                        </div>
                      )}
                      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                        isUser
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}>
                        {!isUser && (
                          <p className="text-[10px] font-bold text-primary-600 mb-1">
                            {msg.sender_name || 'Support'}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator - 3 dots */}
                {adminTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Headphones className="h-3.5 w-3.5 text-primary-600" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0 bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Tapez votre message..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none bg-gray-50 focus:bg-white transition-all"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50 to-white">
              {anonSent ? (
                <div className="text-center py-8 px-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="font-bold text-gray-900 mb-2 text-lg">Message envoye !</p>
                  <p className="text-sm text-gray-600 mb-6">
                    Nous vous repondrons par email. Pour un suivi en temps reel, connectez-vous.
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-primary-900 mb-1">Pas encore connecte ?</p>
                    <p className="text-xs text-primary-700">
                      <Link href="/auth/login" className="underline font-semibold">Connectez-vous</Link>{' '}
                      pour un suivi en temps reel de vos conversations.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={anonName}
                      onChange={(e) => setAnonName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={anonEmail}
                      onChange={(e) => setAnonEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message</label>
                    <textarea
                      value={anonMessage}
                      onChange={(e) => setAnonMessage(e.target.value)}
                      placeholder="Decrivez votre probleme..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAnonSend}
                    disabled={sending || !anonMessage.trim()}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Envoyer le message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Help Page                                                          */
/* ------------------------------------------------------------------ */

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [chatOpen, setChatOpen] = useState(false)

  const categories = [
    { id: 'all', name: 'Tout', icon: Book, color: 'from-gray-500 to-gray-700' },
    { id: 'booking', name: 'Reservations', icon: Home, color: 'from-blue-500 to-blue-700' },
    { id: 'payment', name: 'Paiements', icon: CreditCard, color: 'from-emerald-500 to-emerald-700' },
    { id: 'account', name: 'Compte', icon: Users, color: 'from-violet-500 to-violet-700' },
    { id: 'safety', name: 'Securite', icon: Shield, color: 'from-amber-500 to-amber-700' },
    { id: 'host', name: 'Hotes', icon: Key, color: 'from-rose-500 to-rose-700' }
  ]

  const faqs = [
    {
      id: 1, category: 'booking',
      question: 'Comment reserver un hebergement sur Ikasso ?',
      answer: 'Utilisez la barre de recherche pour choisir votre destination et vos dates. Parcourez les resultats, cliquez sur un logement, verifiez les details et les avis, puis cliquez sur "Reserver" et suivez les etapes de paiement. Vous recevrez une confirmation par email.'
    },
    {
      id: 2, category: 'payment',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons Orange Money (recommande au Mali), les cartes bancaires Visa/Mastercard, PayPal et Stripe. Orange Money est notre methode privilegiee car elle est largement utilisee au Mali et offre des transactions securisees.'
    },
    {
      id: 3, category: 'booking',
      question: 'Puis-je annuler ma reservation ?',
      answer: 'Oui, selon la politique de l\'hote. Flexible : annulation gratuite 24h avant. Moderee : annulation gratuite 5 jours avant. Stricte : remboursement de 50% si annulation 7 jours avant. Consultez les details lors de la reservation.'
    },
    {
      id: 4, category: 'account',
      question: 'Comment creer un compte sur Ikasso ?',
      answer: 'Cliquez sur "S\'inscrire", choisissez voyageur ou hote, remplissez vos informations (nom, email, telephone), creez un mot de passe securise. Vous pouvez aussi vous inscrire avec Google ou Apple.'
    },
    {
      id: 5, category: 'host',
      question: 'Comment devenir hote sur Ikasso ?',
      answer: 'Creez un compte "Hote", ajoutez votre propriete avec des photos de qualite, redigez une description attrayante, fixez vos tarifs et disponibilites, definissez vos regles. Validation en 24-48h, puis vous commencez a recevoir des reservations.'
    },
    {
      id: 6, category: 'payment',
      question: 'Comment fonctionne Orange Money sur Ikasso ?',
      answer: 'Selectionnez Orange Money au moment du paiement, entrez votre numero, recevez un SMS de confirmation, entrez le code pour valider. Votre reservation est confirmee instantanement.'
    },
    {
      id: 7, category: 'safety',
      question: 'Comment Ikasso assure-t-il ma securite ?',
      answer: 'Verification d\'identite obligatoire (NINA), systeme d\'avis bidirectionnel, support client disponible, paiements securises, photos verifiees des proprietes et equipe de moderation active. Tous les hotes sont verifies.'
    },
    {
      id: 8, category: 'booking',
      question: 'Que faire si j\'ai un probleme avec mon hebergement ?',
      answer: 'Contactez d\'abord votre hote via la messagerie Ikasso. Si pas de reponse, contactez notre support via le chat. Nous medierons entre vous et l\'hote. Notre garantie client vous protege en cas de probleme majeur.'
    },
    {
      id: 9, category: 'host',
      question: 'Quelles sont les commissions d\'Ikasso ?',
      answer: '8% pour les particuliers et 10% pour les entreprises/hotels. Ces frais couvrent le marketing, le support client, les paiements securises et la plateforme. Paiements recus 24h apres le check-in via Orange Money ou virement bancaire.'
    },
    {
      id: 10, category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Connectez-vous, allez dans "Parametres" depuis votre tableau de bord, modifiez les champs souhaites et sauvegardez. Certaines modifications (email, telephone) necessitent une verification.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-primary-600 font-medium hidden sm:block">
                Connexion
              </Link>
              <Link href="/auth/register-new" className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 text-sm font-semibold transition-colors">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Headphones className="h-4 w-4" />
            Support disponible 24h/7j
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
            Comment pouvons-nous<br className="hidden sm:block" /> vous aider ?
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Trouvez des reponses ou contactez notre equipe
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-2xl text-base shadow-xl focus:ring-4 focus:ring-primary-300/30 outline-none placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-8 mb-12 relative z-10">
          <button
            onClick={() => setChatOpen(true)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Chat en direct</h3>
            <p className="text-sm text-gray-500">Reponse immediate</p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-semibold">En ligne</span>
            </div>
          </button>

          <a href="mailto:support@ikasso.ml" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Email</h3>
            <p className="text-sm text-gray-500">support@ikasso.ml</p>
            <div className="flex items-center gap-1.5 mt-3">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Reponse sous 24h</span>
            </div>
          </a>

          <a href="tel:+22320224567" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Telephone</h3>
            <p className="text-sm text-gray-500">+223 20 22 45 67</p>
            <div className="flex items-center gap-1.5 mt-3">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Lun-Ven 8h-18h</span>
            </div>
          </a>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Questions frequentes
            {selectedCategory !== 'all' && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                — {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Aucun resultat</h3>
              <p className="text-sm text-gray-500">Essayez un autre terme ou contactez le support.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaq === faq.id
                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-xl border transition-all ${
                      isOpen ? 'border-primary-200 shadow-lg shadow-primary-500/5' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <h3 className="font-semibold text-gray-900 pr-4 text-[15px]">{faq.question}</h3>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        isOpen ? 'bg-primary-100 text-primary-600 rotate-180' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed text-[15px]">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mb-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 sm:p-12 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Vous n'avez pas trouve votre reponse ?
          </h3>
          <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">
            Notre equipe est disponible pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setChatOpen(true)}
              className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Demarrer un chat
            </button>
            <a
              href="mailto:support@ikasso.ml"
              className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="h-5 w-5" />
              Envoyer un email
            </a>
          </div>
        </div>

        {/* Back */}
        <div className="pb-12 text-center">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour a l'accueil
          </Link>
        </div>
      </div>

      <LiveChatWidget open={chatOpen} setOpen={setChatOpen} />
    </div>
  )
}
