import type { Where } from 'payload'

/** Opportunités visibles : publiées et dont la date limite n'est pas dépassée (jour J inclus) */
export const filtreOpportunitesEnCours = (maintenant = new Date()): Where => {
  const debutDuJour = new Date(maintenant)
  debutDuJour.setUTCHours(0, 0, 0, 0)
  return { and: [{ _status: { equals: 'published' } }, { dateLimite: { greater_than_equal: debutDuJour.toISOString() } }] }
}
