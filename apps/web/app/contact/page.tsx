'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ArrowLeft, Minimize2, X, Headphones, CheckCircle2 } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { authFetch } from '../lib/auth-fetch'

/* Live Chat Widget (same as /help) */
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, adminTyping])

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await authFetch('/api/live-chat')
      const data = await res.json()
      if (data.messages) {
        const newCount = data.messages.length
        const lastMsg = data.messages[newCount - 1]
        if (newCount > prevMsgCountRef.current && lastMsg?.sender_type === 'admin') setAdminTyping(false)
        prevMsgCountRef.current = newCount
        setMessages(data.messages)
      }
      if (data.incidentId) setIncidentId(data.incidentId)
    } catch {}
  }, [isAuthenticated])

  useEffect(() => {
    if (!open) { if (intervalRef.current) clearInterval(intervalRef.current); return }
    if (isAuthenticated) {
      setLoadingHistory(true)
      fetchHistory().finally(() => setLoadingHistory(false))
      intervalRef.current = setInterval(fetchHistory, 5000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [open, isAuthenticated, fetchHistory])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true); setInput(''); setAdminTyping(true)
    try {
      const res = await authFetch('/api/live-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, incidentId }) })
      const data = await res.json()
      if (data.messages) { setMessages(data.messages); prevMsgCountRef.current = data.messages.length }
      if (data.incidentId) setIncidentId(data.incidentId)
    } catch {}
    setSending(false)
    setTimeout(() => setAdminTyping(false), 10000)
  }

  const handleAnonSend = async () => {
    const text = anonMessage.trim()
    if (!text || sending) return
    setSending(true)
    try {
      await fetch('/api/live-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, name: anonName, email: anonEmail }) })
      setAnonSent(true)
    } catch {}
    setSending(false)
  }

  const formatTime = (dateStr: string) => { try { return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform" aria-label="Ouvrir le chat">
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative"><div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Headphones className="h-5 w-5" /></div><span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-600" /></div>
              <div><p className="font-bold text-sm">Support Ikasso</p><p className="text-[11px] text-white/80 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" />En ligne</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"><X className="h-5 w-5" /></button>
          </div>
          {isAuthenticated ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                {loadingHistory && messages.length === 0 && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-primary-500" /></div>}
                {!loadingHistory && messages.length === 0 && <div className="text-center py-8"><div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4"><MessageCircle className="h-8 w-8 text-primary-500" /></div><p className="font-semibold text-gray-900 mb-1">Bienvenue !</p><p className="text-sm text-gray-500">Comment pouvons-nous vous aider ?</p></div>}
                {messages.map((msg: any) => {
                  const isUser = msg.sender_type === 'user'
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0"><Headphones className="h-3.5 w-3.5 text-primary-600" /></div>}
                      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${isUser ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'}`}>
                        {!isUser && <p className="text-[10px] font-bold text-primary-600 mb-1">{msg.sender_name || 'Support'}</p>}
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-white/60' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
                {adminTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0"><Headphones className="h-3.5 w-3.5 text-primary-600" /></div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0 bg-white">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder="Tapez votre message..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none bg-gray-50 focus:bg-white transition-all" disabled={sending} />
                <button onClick={handleSend} disabled={sending || !input.trim()} className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Send className="h-4 w-4" /></button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50 to-white">
              {anonSent ? (
                <div className="text-center py-8 px-4"><div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="h-7 w-7 text-green-600" /></div><p className="font-bold text-gray-900 mb-2 text-lg">Message envoye !</p><p className="text-sm text-gray-600 mb-6">Nous vous repondrons par email.</p><Link href="/auth/login" className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">Se connecter</Link></div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4"><p className="text-sm font-semibold text-primary-900 mb-1">Pas encore connecte ?</p><p className="text-xs text-primary-700"><Link href="/auth/login" className="underline font-semibold">Connectez-vous</Link> pour un suivi en temps reel.</p></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom</label><input type="text" value={anonName} onChange={(e) => setAnonName(e.target.value)} placeholder="Votre nom" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label><input type="email" value={anonEmail} onChange={(e) => setAnonEmail(e.target.value)} placeholder="votre@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Message</label><textarea value={anonMessage} onChange={(e) => setAnonMessage(e.target.value)} placeholder="Decrivez votre probleme..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500/20" /></div>
                  <button onClick={handleAnonSend} disabled={sending || !anonMessage.trim()} className="w-full bg-primary-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"><Send className="h-4 w-4" />Envoyer</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function ContactPage() {
  const [chatOpen, setChatOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulation d'envoi
    setTimeout(() => {
      setIsLoading(false)
      alert('Votre message a été envoyé avec succès !\n\nNous vous répondrons dans les plus brefs délais.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      })
    }, 2000)
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
              <Link href="/auth/login" className="text-gray-600 hover:text-primary-600">Connexion</Link>
              <Link href="/auth/register-new" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Inscription</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question ou assistance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de contact</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Phone className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <p className="text-gray-600">+223 20 22 45 67</p>
                    <p className="text-gray-600">+223 76 12 34 56</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Mail className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">contact@ikasso.ml</p>
                    <p className="text-gray-600">support@ikasso.ml</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-600">
                      Quartier du Fleuve<br />
                      Bamako, Mali<br />
                      BP 1234
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horaires</h3>
                    <p className="text-gray-600">
                      Lun - Ven: 8h00 - 18h00<br />
                      Sam: 9h00 - 15h00<br />
                      Dim: Fermé
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat en direct */}
              <div className="mt-8 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <MessageCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="font-semibold text-primary-900">Chat en direct</h3>
                </div>
                <p className="text-primary-700 text-sm mb-3">
                  Besoin d'une réponse immédiate ? Chattez avec notre équipe support.
                </p>
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Demarrer le chat
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="input-field"
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="input-field"
                      placeholder="votre@email.com"
                      value={formData.email}
                      autoComplete="email"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input-field"
                      placeholder="+223 XX XX XX XX"
                      value={formData.phone}
                      autoComplete="tel"
                      inputMode="tel"
                      pattern="(\\+?223\\s?\\d{8})|\\d{8,14}"
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="input-field"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="general">Question générale</option>
                      <option value="booking">Réservation</option>
                      <option value="payment">Paiement</option>
                      <option value="host">Devenir hôte</option>
                      <option value="technical">Problème technique</option>
                      <option value="complaint">Réclamation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="input-field"
                    placeholder="Résumé de votre demande"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="input-field resize-none"
                    placeholder="Décrivez votre demande en détail..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer le message
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-lg text-gray-600">Trouvez rapidement des réponses aux questions les plus courantes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment réserver un hébergement ?</h3>
              <p className="text-gray-600">
                Utilisez notre moteur de recherche pour trouver l'hébergement parfait, sélectionnez vos dates et confirmez votre réservation avec Orange Money ou carte bancaire.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment devenir hôte sur Ikasso ?</h3>
              <p className="text-gray-600">
                Créez un compte hôte, ajoutez votre propriété avec photos et description, fixez vos tarifs et commencez à recevoir des réservations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quels moyens de paiement acceptez-vous ?</h3>
              <p className="text-gray-600">
                Nous acceptons Orange Money (priorité au Mali), les cartes bancaires internationales, PayPal et Klarna pour votre commodité.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Puis-je annuler ma réservation ?</h3>
              <p className="text-gray-600">
                Oui, selon la politique d'annulation de l'hôte. Consultez les conditions lors de la réservation ou contactez-nous pour assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Live Chat Widget */}
      <LiveChatWidget open={chatOpen} setOpen={setChatOpen} />
    </div>
  )
}
