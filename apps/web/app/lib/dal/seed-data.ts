// Centralized data types — real properties come from Supabase

export interface SeedProperty {
  id: string
  title: string
  location: string
  city: string
  price: number
  rating: number
  reviews: number
  images: string[]
  type: string
  guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  description: string
  host: {
    name: string
    avatar: string
    joinedDate: string
    reviews: number
    verified: boolean
    description: string
    responseRate: number
    responseTime: string
  }
  rules: string[]
  reviewsData: {
    id: string
    guestName: string
    guestAvatar: string
    rating: number
    date: string
    comment: string
    photos: string[]
  }[]
  coordinates: { lat: number; lng: number }
  nearbyPlaces: { name: string; distance: string; type: string }[]
  status: string
}

// No fake properties — real properties come from Supabase
export const SEED_PROPERTIES: Record<string, SeedProperty> = {}

export const SEED_PROPERTIES_LIST = Object.values(SEED_PROPERTIES)

// Test accounts for Apple Review
export const TEST_ACCOUNTS = [
  {
    email: 'test@ikasso.ml',
    password: 'Test1234',
    firstName: 'Test',
    lastName: 'Apple',
    userType: 'client' as const,
    phone: '+33600000000',
    verified: true,
  },
  {
    email: 'host@ikasso.ml',
    password: 'Host1234',
    firstName: 'Host',
    lastName: 'Test',
    userType: 'hote' as const,
    phone: '+33600000001',
    verified: true,
  },
]
