import { getStorageMode } from './config'
import { SEED_PROPERTIES, SEED_PROPERTIES_LIST, type SeedProperty } from './seed-data'

export interface Property {
  id: string
  hostId?: string
  title: string
  description: string
  type: string
  address?: string
  city: string
  location: string
  price: number
  guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  rules: string[]
  checkInTime?: string
  checkOutTime?: string
  cancellationPolicy?: string
  images: string[]
  status: string
  rating: number
  reviewCount: number
  reviews?: number
  latitude?: number
  longitude?: number
  host?: SeedProperty['host']
  reviewsData?: SeedProperty['reviewsData']
  coordinates?: { lat: number; lng: number }
  nearbyPlaces?: SeedProperty['nearbyPlaces']
}

function seedToProperty(s: SeedProperty): Property {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    type: s.type,
    city: s.city,
    location: s.location,
    price: s.price,
    guests: s.guests,
    bedrooms: s.bedrooms,
    bathrooms: s.bathrooms,
    amenities: s.amenities,
    rules: s.rules,
    images: s.images,
    status: s.status,
    rating: s.rating,
    reviewCount: s.reviews,
    reviews: s.reviews,
    host: s.host,
    reviewsData: s.reviewsData,
    coordinates: s.coordinates,
    nearbyPlaces: s.nearbyPlaces,
  }
}

function mapSupabaseProperty(row: any): Property {
  return {
    id: row.id,
    hostId: row.host_id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    address: row.address,
    city: row.city,
    location: row.location_description || `${row.city}, ${row.country || 'Mali'}`,
    price: row.price,
    guests: row.guests,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    amenities: row.amenities || [],
    rules: row.rules || [],
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    cancellationPolicy: row.cancellation_policy,
    images: row.images || [],
    status: row.status,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    reviews: row.review_count || 0,
    latitude: row.latitude,
    longitude: row.longitude,
  }
}

export interface PropertyFilters {
  city?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
  amenities?: string[]
  minRating?: number
  query?: string
  limit?: number
  offset?: number
}

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    let query = supabase.from('properties').select('*').eq('status', 'active')

    if (filters?.city) query = query.ilike('city', `%${filters.city}%`)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.minPrice) query = query.gte('price', filters.minPrice)
    if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)
    if (filters?.guests) query = query.gte('guests', filters.guests)
    if (filters?.minRating) query = query.gte('rating', filters.minRating)
    if (filters?.amenities?.length) query = query.contains('amenities', filters.amenities)
    if (filters?.query) query = query.or(`title.ilike.%${filters.query}%,city.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)

    query = query.order('created_at', { ascending: false })
    if (filters?.limit) query = query.limit(filters.limit)
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)

    const { data } = await query
    return (data || []).map(mapSupabaseProperty)
  }

  // localStorage mode — filter seed data + user-created properties
  let all = SEED_PROPERTIES_LIST.map(seedToProperty)

  if (typeof window !== 'undefined') {
    const hostProps = JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
    all = [...all, ...hostProps.map((p: any) => ({
      ...p,
      rating: p.rating || 0,
      reviewCount: p.reviews || 0,
      reviews: p.reviews || 0,
      images: p.images || (p.image ? [p.image] : []),
      location: p.location || `${p.city || ''}, Mali`,
    }))]
  }

  if (filters?.city) all = all.filter(p => p.city.toLowerCase().includes(filters.city!.toLowerCase()) || p.location.toLowerCase().includes(filters.city!.toLowerCase()))
  if (filters?.type) all = all.filter(p => p.type === filters.type)
  if (filters?.minPrice) all = all.filter(p => p.price >= filters.minPrice!)
  if (filters?.maxPrice) all = all.filter(p => p.price <= filters.maxPrice!)
  if (filters?.guests) all = all.filter(p => p.guests >= filters.guests!)
  if (filters?.minRating) all = all.filter(p => p.rating >= filters.minRating!)
  if (filters?.query) {
    const q = filters.query.toLowerCase()
    all = all.filter(p => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  if (filters?.limit) all = all.slice(filters.offset || 0, (filters.offset || 0) + filters.limit)

  return all
}

export async function getProperty(id: string): Promise<Property | null> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase.from('properties').select('*').eq('id', id).single()
    return data ? mapSupabaseProperty(data) : null
  }

  // localStorage fallback
  const seed = SEED_PROPERTIES[id]
  if (seed) return seedToProperty(seed)

  if (typeof window !== 'undefined') {
    const hostProps = JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
    const found = hostProps.find((p: any) => p.id === id)
    if (found) return { ...found, location: found.location || `${found.city || ''}, Mali`, rating: found.rating || 0, reviewCount: 0 }
  }

  return null
}

export async function getHostProperties(hostId?: string): Promise<Property[]> {
  const mode = getStorageMode()

  if (mode === 'supabase' && hostId) {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase.from('properties').select('*').eq('host_id', hostId).order('created_at', { ascending: false })
    return (data || []).map(mapSupabaseProperty)
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
  }
  return []
}

export async function createProperty(input: any): Promise<{ property: Property | null; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { property: null, error: 'Non connecte' }

    const { data, error } = await supabase.from('properties').insert({
      host_id: user.id,
      title: input.title,
      description: input.description,
      type: input.type,
      address: input.address,
      city: input.city,
      price: input.price,
      guests: input.guests,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      amenities: input.amenities,
      rules: input.rules,
      check_in_time: input.checkInTime,
      check_out_time: input.checkOutTime,
      cancellation_policy: input.cancellationPolicy,
      images: input.images,
      status: 'pending',
    }).select().single()

    if (error) return { property: null, error: error.message }
    return { property: mapSupabaseProperty(data), error: null }
  }

  // localStorage mode
  const newProperty = {
    id: `prop-${Date.now()}`,
    ...input,
    status: 'pending',
    rating: 0,
    reviews: 0,
    bookings: 0,
    earnings: 0,
    createdAt: new Date().toISOString(),
  }

  const existing = JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
  existing.push(newProperty)
  localStorage.setItem('ikasso_host_properties', JSON.stringify(existing))

  return { property: newProperty, error: null }
}

export async function updateProperty(id: string, updates: Partial<any>): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { error } = await supabase.from('properties').update(updates).eq('id', id)
    return { error: error?.message || null }
  }

  const existing = JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
  const idx = existing.findIndex((p: any) => p.id === id)
  if (idx >= 0) {
    Object.assign(existing[idx], updates)
    localStorage.setItem('ikasso_host_properties', JSON.stringify(existing))
  }
  return { error: null }
}

export async function deleteProperty(id: string): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { error } = await supabase.from('properties').delete().eq('id', id)
    return { error: error?.message || null }
  }

  const existing = JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
  const filtered = existing.filter((p: any) => p.id !== id)
  localStorage.setItem('ikasso_host_properties', JSON.stringify(filtered))
  return { error: null }
}

export async function uploadPropertyImages(files: File[]): Promise<string[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const urls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('property-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  // localStorage fallback — create blob URLs
  return files.map(f => URL.createObjectURL(f))
}
