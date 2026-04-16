import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Prenom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caracteres minimum'),
  phone: z.string().optional().default(''),
  countryCode: z.string().optional().default('+223'),
  userType: z.enum(['client', 'hote']),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Mali'),
})

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const createPropertySchema = z.object({
  title: z.string().min(3, 'Titre trop court'),
  description: z.string().optional(),
  type: z.enum(['maison', 'hotel', 'appartement', 'villa']),
  address: z.string().optional(),
  city: z.string().min(1, 'Ville requise'),
  price: z.number().int().positive('Prix invalide'),
  guests: z.number().int().min(1).default(2),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  amenities: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  checkInTime: z.string().default('15:00'),
  checkOutTime: z.string().default('11:00'),
  cancellationPolicy: z.string().default('flexible'),
  images: z.array(z.string()).default([]),
})

export const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int().min(1),
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(6),
  specialRequests: z.string().optional(),
  paymentMethod: z.string().optional(),
})

export const createReviewSchema = z.object({
  propertyId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export const sendEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  code: z.string().optional(),
})

export const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('XOF'),
  bookingId: z.string().optional(),
  propertyName: z.string().optional(),
  method: z.enum(['stripe', 'orange_money']),
  phoneNumber: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
