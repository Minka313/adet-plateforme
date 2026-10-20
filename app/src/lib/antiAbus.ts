import { createHash } from 'node:crypto'
import { headers } from 'next/headers'

import type { Payload } from 'payload'

/** Empreinte anonyme du visiteur (IP hachée + secret) : aucune adresse IP n'est stockée en clair. */
export const empreinteVisiteur = async (): Promise<string> => {
  let ip = 'inconnue'
  try {
    const h = await headers()
    ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'inconnue'
  } catch {
    // Hors requête (tests) : empreinte générique
  }
  return createHash('sha256')
    .update(`${ip}:${process.env.PAYLOAD_SECRET ?? ''}`)
    .digest('hex')
    .slice(0, 32)
}

/** Vrai si cette empreinte a déjà envoyé `max` éléments dans la fenêtre donnée. */
export const tropDeRequetes = async (
  payload: Payload,
  collection: 'messages' | 'abonnes',
  empreinte: string,
  { max = 3, minutes = 10 } = {},
): Promise<boolean> => {
  const depuis = new Date(Date.now() - minutes * 60_000).toISOString()
  const { totalDocs } = await payload.count({
    collection,
    where: { and: [{ empreinte: { equals: empreinte } }, { createdAt: { greater_than: depuis } }] },
    overrideAccess: true,
  })
  return totalDocs >= max
}
