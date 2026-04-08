// Centralized demo data — used as localStorage fallback when Supabase is not configured

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

export const SEED_PROPERTIES: Record<string, SeedProperty> = {
  '1': {
    id: '1',
    title: 'Villa Moderne a Bamako',
    location: 'Quartier du Fleuve, Bamako, Mali',
    city: 'Bamako',
    price: 25000,
    rating: 4.8,
    reviews: 24,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    ],
    type: 'maison',
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Climatisation', 'Piscine', 'Parking', 'Cuisine equipee', 'Terrasse'],
    description:
      "Magnifique villa moderne situee dans le quartier prise du Fleuve a Bamako. Cette propriete offre tout le confort moderne avec une piscine privee, une terrasse spacieuse et une vue imprenable sur le fleuve Niger.",
    host: {
      name: 'Aminata Traore',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      joinedDate: 'Janvier 2023',
      reviews: 45,
      verified: true,
      description: "Hote passionnee par l'hospitalite malienne.",
      responseRate: 98,
      responseTime: '1 heure',
    },
    rules: [
      'Arrivee apres 15h00',
      'Depart avant 11h00',
      'Non fumeur',
      'Animaux non autorises',
      'Pas de fetes ou evenements',
    ],
    reviewsData: [
      {
        id: '1',
        guestName: 'Mamadou Diallo',
        guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        date: '2024-10-15',
        comment: 'Sejour exceptionnel ! La villa est encore plus belle qu\'en photos.',
        photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300'],
      },
      {
        id: '2',
        guestName: 'Sarah Johnson',
        guestAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        date: '2024-10-08',
        comment: 'Amazing stay in Bamako! The villa exceeded our expectations.',
        photos: [],
      },
      {
        id: '3',
        guestName: 'Fatou Keita',
        guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        rating: 4,
        date: '2024-09-28',
        comment: 'Tres bon sejour en famille. Les enfants ont adore la piscine !',
        photos: [],
      },
    ],
    coordinates: { lat: 12.6392, lng: -8.0029 },
    nearbyPlaces: [
      { name: 'Marche de Medina', distance: '2.1 km', type: 'Shopping' },
      { name: 'Musee National', distance: '3.5 km', type: 'Culture' },
      { name: 'Pont des Martyrs', distance: '1.8 km', type: 'Monument' },
      { name: 'Restaurant Le Loft', distance: '800 m', type: 'Restaurant' },
    ],
    status: 'active',
  },
  '2': {
    id: '2',
    title: 'Hotel Le Diplomate',
    location: 'ACI 2000, Bamako, Mali',
    city: 'Bamako',
    price: 35000,
    rating: 4.6,
    reviews: 18,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    type: 'hotel',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Climatisation', 'Room Service', 'Parking', 'Restaurant'],
    description: 'Hotel de standing au coeur du quartier des affaires de Bamako.',
    host: {
      name: 'Hotel Le Diplomate',
      avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100',
      joinedDate: 'Mars 2022',
      reviews: 120,
      verified: true,
      description: 'Hotel 4 etoiles a Bamako.',
      responseRate: 100,
      responseTime: '30 minutes',
    },
    rules: ['Arrivee apres 14h00', 'Depart avant 12h00'],
    reviewsData: [
      {
        id: '4',
        guestName: 'Pierre Martin',
        guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 5,
        date: '2024-09-15',
        comment: 'Excellent hotel pour un voyage d\'affaires.',
        photos: [],
      },
    ],
    coordinates: { lat: 12.6335, lng: -8.0156 },
    nearbyPlaces: [
      { name: 'Centre Commercial ACI', distance: '500 m', type: 'Shopping' },
    ],
    status: 'active',
  },
  '3': {
    id: '3',
    title: 'Maison Traditionnelle a Segou',
    location: 'Centre-ville, Segou, Mali',
    city: 'Segou',
    price: 15000,
    rating: 4.9,
    reviews: 32,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    ],
    type: 'maison',
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Climatisation', 'Jardin', 'Cuisine equipee'],
    description: 'Authentique maison malienne au coeur de Segou, la cite des Balanzans.',
    host: {
      name: 'Oumar Coulibaly',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      joinedDate: 'Juin 2023',
      reviews: 28,
      verified: true,
      description: 'Guide et hote a Segou.',
      responseRate: 95,
      responseTime: '2 heures',
    },
    rules: ['Arrivee apres 15h00', 'Depart avant 10h00', 'Non fumeur'],
    reviewsData: [],
    coordinates: { lat: 13.4317, lng: -5.6794 },
    nearbyPlaces: [
      { name: 'Fleuve Niger', distance: '200 m', type: 'Nature' },
    ],
    status: 'active',
  },
  '4': {
    id: '4',
    title: 'Appartement Vue Niger',
    location: 'Badalabougou, Bamako, Mali',
    city: 'Bamako',
    price: 20000,
    rating: 4.5,
    reviews: 12,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    type: 'appartement',
    guests: 3,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Climatisation', 'Balcon', 'Parking'],
    description: 'Bel appartement avec vue imprenable sur le fleuve Niger.',
    host: {
      name: 'Fatoumata Diarra',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      joinedDate: 'Septembre 2023',
      reviews: 15,
      verified: true,
      description: 'Hote a Bamako.',
      responseRate: 90,
      responseTime: '3 heures',
    },
    rules: ['Arrivee apres 14h00', 'Depart avant 11h00'],
    reviewsData: [],
    coordinates: { lat: 12.6200, lng: -8.0100 },
    nearbyPlaces: [],
    status: 'active',
  },
}

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
