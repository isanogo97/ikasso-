import Stripe from 'stripe'

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-03-31.basil' as any,
    })
  }
  return stripeInstance
}
