import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  // Prévisualisation (NEXT_PUBLIC_INDEXATION=non) : site en ligne mais caché des moteurs de recherche
  if (process.env.NEXT_PUBLIC_INDEXATION === 'non') return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
