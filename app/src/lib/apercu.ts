import type { CollectionConfig } from 'payload'

/**
 * Bouton « Aperçu » du back-office : ouvre la page publique en mode brouillon,
 * dans la langue en cours d'édition. L'accès est vérifié côté serveur (utilisateur connecté).
 */
export const urlApercu =
  (collection: 'realisations' | 'actualites'): NonNullable<CollectionConfig['admin']>['preview'] =>
  (doc, { locale }) => {
    const slug = typeof doc?.slug === 'string' ? doc.slug : ''
    if (!slug) return null
    const lang = locale === 'en' ? 'en' : 'fr'
    return `/${lang}/apercu?chemin=${encodeURIComponent(`/${lang}/${collection}/${slug}`)}`
  }
