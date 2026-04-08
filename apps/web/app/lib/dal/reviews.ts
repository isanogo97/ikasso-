import { getStorageMode } from './config'
import { SEED_PROPERTIES } from './seed-data'

export interface Review {
  id: string
  propertyId: string
  guestId: string
  guestName: string
  guestAvatar: string
  bookingId?: string
  rating: number
  comment: string
  photos: string[]
  date: string
  createdAt: string
}

export async function getPropertyReviews(propertyId: string): Promise<Review[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(first_name, last_name, avatar_url)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    return (data || []).map((r: any) => ({
      id: r.id,
      propertyId: r.property_id,
      guestId: r.guest_id,
      guestName: r.profiles ? `${r.profiles.first_name} ${r.profiles.last_name}` : 'Anonyme',
      guestAvatar: r.profiles?.avatar_url || '',
      bookingId: r.booking_id,
      rating: r.rating,
      comment: r.comment || '',
      photos: r.photos || [],
      date: r.created_at?.split('T')[0] || '',
      createdAt: r.created_at,
    }))
  }

  // Seed data fallback
  const seed = SEED_PROPERTIES[propertyId]
  if (seed?.reviewsData) {
    return seed.reviewsData.map(r => ({
      id: r.id,
      propertyId,
      guestId: '',
      guestName: r.guestName,
      guestAvatar: r.guestAvatar,
      rating: r.rating,
      comment: r.comment,
      photos: r.photos,
      date: r.date,
      createdAt: r.date,
    }))
  }
  return []
}

export async function createReview(input: {
  propertyId: string
  bookingId?: string
  rating: number
  comment: string
  photos?: string[]
}): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecte' }

    const { error } = await supabase.from('reviews').insert({
      property_id: input.propertyId,
      guest_id: user.id,
      booking_id: input.bookingId || null,
      rating: input.rating,
      comment: input.comment,
      photos: input.photos || [],
    })
    return { error: error?.message || null }
  }

  // localStorage fallback
  const reviews = JSON.parse(localStorage.getItem('ikasso_reviews') || '[]')
  reviews.push({
    id: `review-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem('ikasso_reviews', JSON.stringify(reviews))
  return { error: null }
}
