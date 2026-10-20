import { getPayload } from 'payload'
import { cache } from 'react'

import type { Langue } from '@/i18n/config'
import config from '@/payload.config'

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getAssociation = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'association', depth: 1, locale: lang, fallbackLocale: 'fr' })
})

export const getCoordonnees = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'coordonnees' })
})

/** Options communes de lecture localisée */
export const loc = (lang: Langue) => ({ locale: lang, fallbackLocale: 'fr' as const })
