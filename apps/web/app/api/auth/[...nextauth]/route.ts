import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Récupérer l'utilisateur depuis localStorage (côté client)
        // Pour la production, utiliser une vraie base de données
        const users = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
          : []
        
        const user = users.find((u: any) => u.email === credentials.email)
        
        if (user && user.password === credentials.password) {
          return {
            id: user.email,
            email: user.email,
            name: user.fullName || user.name,
            image: user.avatar
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sauvegarder l'utilisateur OAuth dans localStorage
      if (account?.provider === 'google' || account?.provider === 'apple') {
        const userData = {
          email: user.email,
          name: user.name,
          avatar: user.image,
          provider: account.provider,
          emailVerified: true, // OAuth = email déjà vérifié
          phoneVerified: false,
          createdAt: new Date().toISOString()
        }

        // Pour la production, sauvegarder dans une base de données
        if (typeof window !== 'undefined') {
          const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
          const existingUserIndex = allUsers.findIndex((u: any) => u.email === user.email)
          
          if (existingUserIndex >= 0) {
            allUsers[existingUserIndex] = { ...allUsers[existingUserIndex], ...userData }
          } else {
            allUsers.push(userData)
          }
          
          localStorage.setItem('ikasso_all_users', JSON.stringify(allUsers))
          localStorage.setItem('ikasso_user', JSON.stringify(userData))
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt'
  }
})

export { handler as GET, handler as POST }

