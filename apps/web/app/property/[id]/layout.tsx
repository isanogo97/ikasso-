import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  // Try to fetch property from Supabase for dynamic meta
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${id}&select=title,description,city,price,images`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 3600 },
      })
      const data = await res.json()
      if (data?.[0]) {
        const prop = data[0]
        return {
          title: `${prop.title} - Ikasso`,
          description: `${prop.description?.substring(0, 155)}...`,
          openGraph: {
            title: prop.title,
            description: `Hebergement a ${prop.city} - ${prop.price?.toLocaleString('fr-FR')} FCFA/nuit`,
            images: prop.images?.[0] ? [{ url: prop.images[0], width: 800, height: 600 }] : [],
            type: 'website',
          },
        }
      }
    }
  } catch {}

  return {
    title: `Hebergement au Mali - Ikasso`,
    description: 'Decouvrez cet hebergement au Mali sur Ikasso. Reservation simple et securisee.',
  }
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
