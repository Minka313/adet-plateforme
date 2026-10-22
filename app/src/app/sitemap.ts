import type { MetadataRoute } from 'next'

import { LANGUES } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const PAGES = ['', '/decouvrir-kolda', '/opportunites', '/se-former', '/a-propos', '/realisations', '/actualites', '/equipe', '/partenaires', '/documents', '/contact']

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const publie = { _status: { equals: 'published' } } as const
  const [realisations, actualites] = await Promise.all([
    payload.find({ collection: 'realisations', where: publie, limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'actualites', where: publie, limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  const entree = (chemin: string, modif?: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE}/fr${chemin}`,
    lastModified: modif ? new Date(modif) : new Date(),
    alternates: { languages: Object.fromEntries(LANGUES.map((l) => [l, `${SITE}/${l}${chemin}`])) },
  })
  return [
    ...PAGES.map((p) => entree(p)),
    ...realisations.docs.map((r) => entree(`/realisations/${r.slug}`, r.updatedAt)),
    ...actualites.docs.map((a) => entree(`/actualites/${a.slug}`, a.updatedAt)),
  ]
}
