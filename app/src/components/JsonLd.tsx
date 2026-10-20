import type { Langue } from '@/i18n/config'
import { getAssociation, getCoordonnees } from '@/lib/payload'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/** Données structurées schema.org (organisation non gouvernementale) pour les moteurs de recherche. */
export async function JsonLd({ lang }: { lang: Langue }) {
  const [asso, co] = await Promise.all([getAssociation(lang), getCoordonnees()])
  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: asso.nom,
    alternateName: asso.sigle,
    url: `${SITE}/${lang}`,
    logo: `${SITE}/brand/adet-logo.png`,
    description: asso.mission,
    email: co.email || undefined,
    telephone: co.telephones?.map((t) => t.numero),
    address: { '@type': 'PostalAddress', addressLocality: 'Kolda', addressCountry: 'SN', streetAddress: co.adresse?.split('\n')[0] },
    areaServed: ['Kolda', 'Ziguinchor', 'Sédhiou'],
    sameAs: co.reseaux?.map((r) => r.url),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees).replace(/</g, '\\u003c') }} />
}
