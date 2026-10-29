import { getPayload } from 'payload'
import { cache } from 'react'

import type { Langue } from '@/i18n/config'
import type { Session } from '@/payload-types'
import config from '@/payload.config'

import { etatSession, filtreInscriptionsActives, filtreSessionsAVenir } from './formations'
import { filtreOpportunitesEnCours } from './opportunites'

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getAssociation = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'association', depth: 1, locale: lang, fallbackLocale: 'fr' })
})

export const getCoordonnees = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'coordonnees' })
})

export const getPhotos = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'photos', depth: 1 })
})

export const getTerritoires = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'territoires', sort: 'ordre', limit: 50, depth: 1, ...loc(lang) })
  return docs
})

export const getFilieres = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'filieres', sort: 'ordre', limit: 50, depth: 1, ...loc(lang) })
  return docs
})

export const getStructures = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'structures', sort: 'ordre', limit: 100, depth: 0, ...loc(lang) })
  return docs
})

/** Opportunités publiées dont la date limite n'est pas dépassée (les autres disparaissent d'elles-mêmes) */
export const getOpportunitesEnCours = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'opportunites',
    where: filtreOpportunitesEnCours(),
    sort: 'dateLimite',
    limit: 100,
    depth: 1,
    ...loc(lang),
  })
  return docs
})

export const getFormations = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'formations',
    where: { _status: { equals: 'published' } },
    sort: 'titre',
    limit: 100,
    ...loc(lang),
  })
  return docs
})

/** Ajoute à une session le nombre de places restantes et l'état des inscriptions */
const avecPlaces = async (session: Session) => {
  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({ collection: 'inscriptions', where: filtreInscriptionsActives(session.id), overrideAccess: true })
  return {
    ...session,
    restantes: session.places ? Math.max(session.places - totalDocs, 0) : null,
    etat: etatSession(session, totalDocs),
  }
}

export type SessionAffichee = Awaited<ReturnType<typeof avecPlaces>>

/** Sessions à venir des formations publiées, de la plus proche à la plus lointaine */
export const getSessionsAVenir = cache(async (lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sessions',
    where: filtreSessionsAVenir(),
    sort: 'dateDebut',
    limit: 200,
    depth: 0,
    ...loc(lang),
  })
  return Promise.all(docs.map(avecPlaces))
})

/** Une session à venir et sa formation publiée, ou null */
export const getSessionAVenir = cache(async (id: number, lang: Langue) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sessions',
    where: { and: [{ id: { equals: id } }, filtreSessionsAVenir()] },
    limit: 1,
    depth: 1,
    ...loc(lang),
  })
  const session = docs[0]
  if (!session || typeof session.formation !== 'object') return null
  return { ...(await avecPlaces(session)), formation: session.formation }
})

/** Options communes de lecture localisée */
export const loc = (lang: Langue) => ({ locale: lang, fallbackLocale: 'fr' as const })
