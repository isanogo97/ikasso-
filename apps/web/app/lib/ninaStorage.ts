"use client"

export type NinaInfo = {
  nina: string
  dob?: string
  verified?: boolean
  message?: string
  updatedAt: number
}

const KEY = 'ikasso:user:nina'

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

export function getNinaLocal(): NinaInfo | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setNinaLocal(info: NinaInfo) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...info, updatedAt: Date.now() }))
  } catch {
    // ignore
  }
}

