import type { Where } from 'payload'

import type { Session } from '@/payload-types'

export type EtatSession = 'ouverte' | 'complete' | 'fermee'

const debutDuJour = (maintenant: Date) => {
  const d = new Date(maintenant)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/** Sessions visibles : formation publiée et session pas encore commencée (jour J inclus) */
export const filtreSessionsAVenir = (maintenant = new Date()): Where => ({
  and: [{ dateDebut: { greater_than_equal: debutDuJour(maintenant).toISOString() } }, { 'formation._status': { equals: 'published' } }],
})

/** Une inscription annulée libère sa place */
export const filtreInscriptionsActives = (sessionId: number): Where => ({
  and: [{ session: { equals: sessionId } }, { statut: { not_equals: 'annulee' } }],
})

/**
 * Peut-on encore s'inscrire ? Fermée si l'équipe l'a décidé, si la date limite est passée
 * ou si la session a commencé (inscriptions possibles jusqu'à la veille par défaut) ; complète si toutes les places sont prises.
 */
export const etatSession = (
  s: Pick<Session, 'dateDebut' | 'dateLimiteInscription' | 'inscriptionsOuvertes' | 'places'>,
  inscrits: number,
  maintenant = new Date(),
): EtatSession => {
  const aujourdhui = debutDuJour(maintenant)
  if (!s.inscriptionsOuvertes) return 'fermee'
  if (debutDuJour(new Date(s.dateDebut)) <= aujourdhui) return 'fermee'
  if (s.dateLimiteInscription && new Date(s.dateLimiteInscription) < aujourdhui) return 'fermee'
  if (s.places && inscrits >= s.places) return 'complete'
  return 'ouverte'
}
