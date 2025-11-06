'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { 
  MapPin, Star, Heart, Users, Bed, Bath, Wifi, Car, 
  Waves, Utensils, Calendar, ArrowLeft, Share, Flag,
  ChevronDown, Filter, MessageCircle, Phone, Mail,
  Copy, Facebook, Twitter, ExternalLink, Camera
} from 'lucide-react'

// Sample property data (in a real app, this would come from an API)
const propertyData = {
  '1': {
    id: '1',
    title: 'Villa Moderne à Bamako',
    location: 'Quartier du Fleuve, Bamako, Mali',
    price: 25000,
    rating: 4.8,
    reviews: 24,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ],
    type: 'maison',
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Climatisation', 'Piscine', 'Parking', 'Cuisine équipée', 'Terrasse'],
    description: 'Magnifique villa moderne située dans le quartier prisé du Fleuve à Bamako. Cette propriété offre tout le confort moderne avec une piscine privée, une terrasse spacieuse et une vue imprenable sur le fleuve Niger. Parfait pour les familles ou les groupes d\'amis souhaitant découvrir Bamako dans le confort.',
    host: {
      name: 'Aminata Traoré',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      joinedDate: 'Janvier 2023',
      reviews: 45,
      verified: true,
      description: 'Hôte passionnée par l\'hospitalité malienne. Je vis à Bamako depuis 15 ans et j\'adore faire découvrir ma ville aux voyageurs.',
      responseRate: 98,
      responseTime: '1 heure'
    },
    rules: [
      'Arrivée après 15h00',
      'Départ avant 11h00',
      'Non fumeur',
      'Animaux non autorisés',
      'Pas de fêtes ou événements'
    ],
    reviewsData: [
      {
        id: '1',
        guestName: 'Mamadou Diallo',
        guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        date: '2024-10-15',
        comment: 'Séjour exceptionnel ! La villa est encore plus belle qu\'en photos. Aminata est une hôte formidable, très accueillante et de bons conseils pour découvrir Bamako. La piscine était parfaite après nos journées de visite. Je recommande vivement !',
        photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300']
      },
      {
        id: '2',
        guestName: 'Sarah Johnson',
        guestAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        date: '2024-10-08',
        comment: 'Amazing stay in Bamako! The villa exceeded our expectations. Very clean, well-equipped kitchen, and the pool area is gorgeous. Aminata was so helpful with restaurant recommendations. The location is perfect for exploring the city.',
        photos: []
      },
      {
        id: '3',
        guestName: 'Fatou Keita',
        guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        rating: 4,
        date: '2024-09-28',
        comment: 'Très bon séjour en famille. Les enfants ont adoré la piscine ! L\'hébergement est confortable et bien situé. Petit bémol sur le WiFi qui était parfois instable, mais rien de grave. Aminata est très réactive et arrangeante.',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300']
      },
      {
        id: '4',
        guestName: 'Ibrahim Sanogo',
        guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 5,
        date: '2024-09-20',
        comment: 'Villa magnifique avec une vue splendide sur le fleuve. L\'emplacement est idéal, proche du centre mais au calme. Aminata nous a accueillis avec le sourire et nous a donné plein de conseils. La terrasse est parfaite pour les soirées !',
        photos: []
      },
      {
        id: '5',
        guestName: 'Marie Dubois',
        guestAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        rating: 5,
        date: '2024-09-12',
        comment: 'Un séjour inoubliable ! La villa est spacieuse, très propre et parfaitement équipée. La piscine est un vrai plus. Aminata est aux petits soins pour ses invités. Je reviendrai sans hésiter lors de mon prochain voyage au Mali.',
        photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300']
      },
      {
        id: '6',
        guestName: 'Ousmane Touré',
        guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        rating: 4,
        date: '2024-08-30',
        comment: 'Bon hébergement dans l\'ensemble. La villa est bien entretenue et la localisation est pratique. Seul petit point d\'amélioration : il manquait quelques ustensiles de cuisine, mais Aminata a rapidement résolu le problème.',
        photos: []
      }
    ],
    coordinates: {
      lat: 12.6392,
      lng: -8.0029
    },
    nearbyPlaces: [
      { name: 'Marché de Médina', distance: '2.1 km', type: 'Shopping' },
      { name: 'Musée National', distance: '3.5 km', type: 'Culture' },
      { name: 'Pont des Martyrs', distance: '1.8 km', type: 'Monument' },
      { name: 'Restaurant Le Loft', distance: '800 m', type: 'Restaurant' }
    ]
  },
  '2': {
    id: '2',
    title: 'Hôtel Le Diplomate',
    location: 'Centre-ville, Sikasso, Mali',
    price: 35000,
    rating: 4.6,
    reviews: 18,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    ],
    type: 'hotel',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Restaurant', 'Spa', 'Salle de sport', 'Climatisation', 'Service de chambre'],
    description: 'Hôtel moderne au cœur de Sikasso, offrant tout le confort d\'un établissement 4 étoiles. Idéal pour les voyageurs d\'affaires et les touristes souhaitant explorer la région de Sikasso et ses environs.',
    host: {
      name: 'Sekou Konaté',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      joinedDate: 'Mars 2022',
      reviews: 67,
      verified: true,
      description: 'Directeur d\'hôtel expérimenté, passionné par l\'accueil et le service client. Je veille personnellement au confort de nos clients.',
      responseRate: 100,
      responseTime: '30 minutes'
    },
    rules: [
      'Arrivée après 14h00',
      'Départ avant 12h00',
      'Non fumeur dans les chambres',
      'Animaux acceptés sur demande',
      'Service de conciergerie disponible'
    ],
    reviewsData: [
      {
        id: '1',
        guestName: 'Djénéba Coulibaly',
        guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        rating: 5,
        date: '2024-10-10',
        comment: 'Excellent hôtel ! Le service est impeccable, le personnel très professionnel. La chambre était spacieuse et très propre. Le restaurant de l\'hôtel propose une cuisine délicieuse. Je recommande vivement !',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300']
      },
      {
        id: '2',
        guestName: 'Pierre Martin',
        guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4,
        date: '2024-09-25',
        comment: 'Très bon séjour professionnel. L\'hôtel est bien situé, les chambres confortables et le WiFi excellent. Seul petit bémol : le petit-déjeuner pourrait être plus varié.',
        photos: []
      },
      {
        id: '3',
        guestName: 'Aisha Diarra',
        guestAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        date: '2024-09-15',
        comment: 'Séjour parfait ! L\'accueil était chaleureux, la chambre magnifique avec une belle vue. Le spa est un vrai plus pour se détendre après une journée de visite.',
        photos: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300']
      }
    ],
    coordinates: {
      lat: 11.3170,
      lng: -5.6670
    },
    nearbyPlaces: [
      { name: 'Marché Central', distance: '500 m', type: 'Shopping' },
      { name: 'Mosquée de Sikasso', distance: '1.2 km', type: 'Culture' },
      { name: 'Parc National', distance: '15 km', type: 'Nature' },
      { name: 'Restaurant Teranga', distance: '300 m', type: 'Restaurant' }
    ]
  },
  '3': {
    id: '3',
    title: 'Maison Traditionnelle Dogon',
    location: 'Pays Dogon, Mopti, Mali',
    price: 15000,
    rating: 4.9,
    reviews: 32,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    type: 'maison',
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Vue panoramique', 'Cuisine équipée', 'Terrasse', 'Artisanat local', 'Guide culturel'],
    description: 'Découvrez l\'authentique culture Dogon dans cette maison traditionnelle avec vue imprenable sur les falaises. Une expérience unique au cœur du patrimoine malien.',
    host: {
      name: 'Amadou Dolo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      joinedDate: 'Juin 2021',
      reviews: 89,
      verified: true,
      description: 'Guide culturel et gardien des traditions Dogon. Je partage avec plaisir l\'histoire et les coutumes de mon peuple avec les visiteurs.',
      responseRate: 95,
      responseTime: '2 heures'
    },
    rules: [
      'Respect des traditions locales',
      'Arrivée avant le coucher du soleil',
      'Participation aux activités culturelles encouragée',
      'Photos respectueuses uniquement',
      'Contribution au développement local'
    ],
    reviewsData: [
      {
        id: '1',
        guestName: 'Sophie Dubois',
        guestAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        rating: 5,
        date: '2024-10-05',
        comment: 'Expérience absolument magique ! Amadou est un hôte extraordinaire qui nous a fait découvrir la richesse de la culture Dogon. La vue depuis la terrasse est à couper le souffle. Inoubliable !',
        photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300']
      },
      {
        id: '2',
        guestName: 'Marco Rossi',
        guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        date: '2024-09-18',
        comment: 'An incredible cultural immersion! The traditional architecture and Amadou\'s storytelling made this stay unforgettable. The sunrise view from the cliff is spectacular.',
        photos: []
      },
      {
        id: '3',
        guestName: 'Fatima Traoré',
        guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        rating: 5,
        date: '2024-08-22',
        comment: 'Une immersion totale dans la culture Dogon. Amadou nous a fait visiter les villages, expliqué les traditions. La maison est authentique et confortable. Merci pour cette belle découverte !',
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300']
      }
    ],
    coordinates: {
      lat: 14.2350,
      lng: -3.9970
    },
    nearbyPlaces: [
      { name: 'Falaises de Bandiagara', distance: '2 km', type: 'Nature' },
      { name: 'Village de Sangha', distance: '5 km', type: 'Culture' },
      { name: 'Marché artisanal', distance: '3 km', type: 'Shopping' },
      { name: 'Point de vue panoramique', distance: '1 km', type: 'Nature' }
    ]
  }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string
  const property = propertyData[propertyId as keyof typeof propertyData]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [reviewFilter, setReviewFilter] = useState('all')
  const [showContactModal, setShowContactModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [bookingErrors, setBookingErrors] = useState<string[]>([])
  const [isBookingLoading, setIsBookingLoading] = useState(false)

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hébergement non trouvé</h1>
          <a href="/" className="btn-primary">Retour à l'accueil</a>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights * property.price : 0
  }

  const nights = calculateTotal() / property.price || 0

  // Filter reviews based on rating
  const filteredReviews = property.reviewsData?.filter(review => {
    if (reviewFilter === 'all') return true
    if (reviewFilter === '5') return review.rating === 5
    if (reviewFilter === '4') return review.rating >= 4
    if (reviewFilter === '3') return review.rating >= 3
    return true
  }) || []

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = `Découvrez ${property.title} sur Ikasso`
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        alert('Lien copié dans le presse-papiers !')
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Regardez cet hébergement : ${url}`)}`
        break
    }
    setShowShareModal(false)
  }

  const validateBooking = () => {
    const errors: string[] = []
    
    if (!checkIn) {
      errors.push('Veuillez sélectionner une date d\'arrivée')
    }
    
    if (!checkOut) {
      errors.push('Veuillez sélectionner une date de départ')
    }
    
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (startDate < today) {
        errors.push('La date d\'arrivée ne peut pas être dans le passé')
      }
      
      if (endDate <= startDate) {
        errors.push('La date de départ doit être après la date d\'arrivée')
      }
      
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 30) {
        errors.push('La durée maximum de séjour est de 30 jours')
      }
    }
    
    if (guests > property.guests) {
      errors.push(`Cet hébergement peut accueillir maximum ${property.guests} voyageurs`)
    }
    
    if (guests < 1) {
      errors.push('Veuillez sélectionner au moins 1 voyageur')
    }
    
    setBookingErrors(errors)
    return errors.length === 0
  }

  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!validateBooking()) {
      return
    }
    
    setIsBookingLoading(true)
    
    // Simulate booking process
    setTimeout(() => {
      setIsBookingLoading(false)
      window.location.href = `/booking/${propertyId}?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-primary-600">Ikasso</a>
              <span className="ml-2 text-sm text-gray-500">Chez Toi</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-primary-600">Accueil</a>
              <a href="#" className="text-gray-700 hover:text-primary-600">Hébergements</a>
              <a href="/host" className="text-gray-700 hover:text-primary-600">Devenir Hôte</a>
              <a href="/pricing" className="text-gray-700 hover:text-primary-600">Tarifs</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <a href="/" className="flex items-center text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux résultats
          </a>
        </div>

        {/* Property Title and Actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{property.rating}</span>
                <span className="ml-1">({property.reviews} avis)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Share className="h-4 w-4" />
              <span>Partager</span>
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative mb-4">
                <Image 
                  src={property.images[currentImageIndex]} 
                  alt={property.title}
                  width={1200}
                  height={600}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden ${
                      currentImageIndex === index ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <Image 
                      src={image} 
                      alt={`Photo ${index + 1}`}
                      width={200}
                      height={120}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {property.type === 'maison' ? 'Maison' : property.type === 'hotel' ? 'Hôtel' : 'Appartement'} 
                  {' '}hébergé par {property.host.name}
                </h2>
                <Image 
                  src={property.host.avatar} 
                  alt={property.host.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              </div>

              <div className="flex items-center space-x-6 mb-6 text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{property.guests} voyageurs</span>
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-2" />
                  <span>{property.bedrooms} chambres</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-2" />
                  <span>{property.bathrooms} salles de bain</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Équipements</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    {amenity === 'WiFi' && <Wifi className="h-5 w-5 mr-3 text-gray-600" />}
                    {amenity === 'Parking' && <Car className="h-5 w-5 mr-3 text-gray-600" />}
                    {amenity === 'Piscine' && <Waves className="h-5 w-5 mr-3 text-gray-600" />}
                    {amenity === 'Cuisine équipée' && <Utensils className="h-5 w-5 mr-3 text-gray-600" />}
                    {!['WiFi', 'Parking', 'Piscine', 'Cuisine équipée'].includes(amenity) && 
                      <div className="w-5 h-5 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    }
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Règlement intérieur</h3>
              <ul className="space-y-2">
                {property.rules.map((rule, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location & Map Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-6">Emplacement</h3>
              
              {/* Map Placeholder */}
              <div className="relative mb-6">
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Carte interactive</p>
                    <p className="text-sm text-gray-500">
                      Coordonnées: {property.coordinates.lat}, {property.coordinates.lng}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  {property.location}
                </p>
              </div>

              {/* Nearby Places */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">À proximité</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.nearbyPlaces.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          {place.type === 'Shopping' && <span className="text-primary-600 text-xs">🛍️</span>}
                          {place.type === 'Culture' && <span className="text-primary-600 text-xs">🏛️</span>}
                          {place.type === 'Monument' && <span className="text-primary-600 text-xs">🏗️</span>}
                          {place.type === 'Restaurant' && <span className="text-primary-600 text-xs">🍽️</span>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{place.name}</p>
                          <p className="text-sm text-gray-600">{place.type}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Transport</h4>
                    <p className="text-sm text-gray-600">Accès facile en taxi ou transport public</p>
                  </div>
                  <button className="btn-secondary flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Voir sur Google Maps</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-semibold">Avis des voyageurs</h3>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-lg">{property.rating}</span>
                    <span className="text-gray-600 ml-1">({property.reviews} avis)</span>
                  </div>
                </div>
                
                {filteredReviews.length > 0 && (
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Tous les avis</option>
                    <option value="5">5 étoiles</option>
                    <option value="4">4+ étoiles</option>
                    <option value="3">3+ étoiles</option>
                  </select>
                )}
              </div>

              {/* Rating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = property.reviewsData?.filter(r => r.rating === rating).length || 0
                  const percentage = property.reviewsData ? (count / property.reviewsData.length) * 100 : 0
                  
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <Image 
                        src={review.guestAvatar} 
                        alt={review.guestName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.guestName}</h4>
                            <p className="text-sm text-gray-600">{formatDate(review.date)}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                        
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex space-x-2">
                            {review.photos.map((photo, index) => (
                              <Image 
                                key={index}
                                src={photo} 
                                alt={`Photo ${index + 1} de l'avis`}
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredReviews.length > 3 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="btn-secondary"
                  >
                    {showAllReviews ? 'Voir moins d\'avis' : `Voir tous les avis (${filteredReviews.length})`}
                  </button>
                </div>
              )}

              {filteredReviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun avis ne correspond à vos critères.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold">{formatPrice(property.price)}</span>
                  <span className="text-gray-600 ml-1">/ nuit</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{property.rating}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                      <input
                        type="date"
                        className="input-field"
                        value={checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setCheckIn(e.target.value)
                          setBookingErrors([])
                        }}
                      />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                    <input
                      type="date"
                      className="input-field"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setCheckOut(e.target.value)
                        setBookingErrors([])
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                  <select
                    className="input-field"
                    value={guests}
                    onChange={(e) => {
                      setGuests(Number(e.target.value))
                      setBookingErrors([])
                    }}
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'voyageur' : 'voyageurs'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="border-t pt-4 mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span>{formatPrice(property.price)} × {nights} nuits</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de service</span>
                    <span>{formatPrice(Math.round(calculateTotal() * 0.08))}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal() + Math.round(calculateTotal() * 0.08))}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookingClick}
                disabled={isBookingLoading}
                className={`block w-full btn-primary py-3 text-lg text-center ${isBookingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isBookingLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </div>
                ) : !checkIn || !checkOut ? 'Sélectionner les dates' : 'Réserver'}
              </button>

              {/* Booking Errors */}
              {bookingErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ul className="text-sm text-red-700 space-y-1">
                    {bookingErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mt-4">
                Vous ne serez pas débité pour le moment
              </p>

              {/* Host Info */}
              <div className="border-t mt-6 pt-6">
                <div className="flex items-center space-x-3">
                  <Image 
                    src={property.host.avatar} 
                    alt={property.host.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{property.host.name}</p>
                    <p className="text-sm text-gray-500">
                      Hôte depuis {property.host.joinedDate}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full mt-4 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                >
                  Contacter l'hôte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Host Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Contacter {property.host.name}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Image 
                  src={property.host.avatar} 
                  alt={property.host.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{property.host.name}</h4>
                  <p className="text-sm text-gray-600">{property.host.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Taux de réponse: {property.host.responseRate}%</span>
                    <span>Répond en: {property.host.responseTime}</span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre message
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Bonjour, j'aimerais en savoir plus sur votre hébergement..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Envoyer
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Autres moyens de contact :</p>
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Appeler</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Partager cet hébergement</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Copy className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Copier le lien</span>
                </button>
                
                <button
                  onClick={() => handleShare('email')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Lien direct :</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                    className="flex-1 input-field text-sm"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="btn-secondary px-3 py-2"
                  >
                    Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
