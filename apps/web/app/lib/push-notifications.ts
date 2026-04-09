// Push Notifications System for Ikasso
// Uses the Web Push API (works on Android Chrome, Desktop browsers)
// iOS Safari supports push since iOS 16.4+ for PWA

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied'
  return await Notification.requestPermission()
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  const permission = await requestPermission()
  if (permission !== 'granted') return null

  try {
    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing

    // Subscribe
    const subOptions: PushSubscriptionOptionsInit = {
      userVisibleOnly: true,
    }
    if (VAPID_PUBLIC_KEY) {
      subOptions.applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any
    }
    const subscription = await registration.pushManager.subscribe(subOptions)

    // Send subscription to server
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
    } catch {}

    return subscription
  } catch (err) {
    console.error('Push subscription failed:', err)
    return null
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      try {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      } catch {}
      return true
    }
  } catch {}
  return false
}

// Send a local notification (no server needed)
export function sendLocalNotification(title: string, options?: NotificationOptions): void {
  if (!isPushSupported() || Notification.permission !== 'granted') return
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      icon: '/images/logos/ikasso-logo-200.png',
      badge: '/images/logos/ikasso-icon.png',
      ...options,
    } as any)
  })
}

// Utility
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
