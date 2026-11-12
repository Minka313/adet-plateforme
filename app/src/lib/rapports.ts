import type { Payload } from 'payload'

import { estBureau, isAdmin } from '../access'
import { notifier } from './notifier'
import { echeance, joursRestants, libellePeriode, periodeARendre } from './periodes'
import type { ModeleRapport, User } from '../payload-types'

const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null | undefined))
const ids = (v: unknown) => (Array.isArray(v) ? v.map(id).filter((x): x is number => typeof x === 'number') : [])

type Modele = Pick<ModeleRapport, 'rolesAuteurs' | 'polesAuteurs' | 'personnesAuteurs' | 'validateurs'>
type Personne = Pick<User, 'id' | 'roles' | 'pole'>

/** Cette personne doit-elle rendre ce type de rapport ? (par rôle, par pôle ou nommément) */
export function estAuteur(m: Modele, u: Personne): boolean {
  const roles = m.rolesAuteurs ?? []
  if (roles.length && (u.roles ?? []).some((r) => (roles as string[]).includes(r))) return true
  const pole = id(u.pole)
  if (pole && ids(m.polesAuteurs).includes(pole)) return true
  return ids(m.personnesAuteurs).includes(u.id)
}

/** Peut-elle valider les rapports de ce modèle ? Par défaut le bureau ; sinon les personnes choisies (et les administrateurs) */
export function estValidateur(m: Modele, u: Personne): boolean {
  const choisis = ids(m.validateurs)
  if (!choisis.length) return estBureau(u)
  return choisis.includes(u.id) || isAdmin(u)
}

/** Les validateurs d'un modèle, pour les recopier sur chaque rapport (droits de lecture) et les notifier */
export async function idsValidateurs(payload: Payload, m: Modele): Promise<number[]> {
  const choisis = ids(m.validateurs)
  if (choisis.length) return choisis
  const { docs } = await payload.find({
    collection: 'users',
    where: { and: [{ roles: { in: ['bureau'] } }, { actif: { not_equals: false } }] },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  if (docs.length) return docs.map((u) => u.id)
  // Pas encore de bureau désigné : les administrateurs valident
  const admins = await payload.find({ collection: 'users', where: { roles: { in: ['admin'] } }, limit: 100, depth: 0, overrideAccess: true })
  return admins.docs.map((u) => u.id)
}

/** Les comptes actifs qui doivent rendre ce modèle */
export async function auteursDe(payload: Payload, m: Modele): Promise<User[]> {
  const { docs } = await payload.find({ collection: 'users', where: { actif: { not_equals: false } }, limit: 1000, depth: 0, overrideAccess: true })
  return docs.filter((u) => estAuteur(m, u))
}

/** Les deux modèles proposés au directeur, modifiables ensuite */
export const MODELES_PROPOSES = [
  {
    titre: 'Rapport mensuel de pôle',
    description: 'Le point du mois de chaque pôle : ce qui a été fait, les résultats, les difficultés et la suite.',
    periodicite: 'mensuel' as const,
    jourLimite: 5,
    rolesAuteurs: ['responsable' as const],
    sections: [
      { intitule: 'Activités réalisées', aide: 'Formations, rencontres, missions, actions de communication…', obligatoire: true },
      { intitule: 'Résultats et chiffres', aide: 'Nombre de bénéficiaires (dont femmes et jeunes), partenaires mobilisés…', obligatoire: true },
      { intitule: 'Difficultés rencontrées', aide: '', obligatoire: false },
      { intitule: 'Prévisions pour le mois prochain', aide: '', obligatoire: true },
      { intitule: 'Besoins et appuis demandés', aide: 'Moyens, validations, contacts…', obligatoire: false },
    ],
  },
  {
    titre: 'Compte rendu d’activité',
    description: 'Après chaque activité de terrain (formation, atelier, rencontre) : à rendre dans la semaine.',
    periodicite: 'ponctuel' as const,
    jourLimite: 5,
    rolesAuteurs: ['responsable' as const, 'membre' as const, 'formateur' as const],
    sections: [
      { intitule: 'Activité, date et lieu', aide: '', obligatoire: true },
      { intitule: 'Participants', aide: 'Nombre total, dont femmes et dont jeunes de moins de 35 ans', obligatoire: true },
      { intitule: 'Déroulement', aide: '', obligatoire: true },
      { intitule: 'Résultats obtenus', aide: '', obligatoire: true },
      { intitule: 'Suites à donner', aide: '', obligatoire: false },
    ],
  },
]

/**
 * Relances des rapports périodiques, lancées chaque matin : 3 jours avant la date limite, puis le jour même,
 * aux auteurs qui n'ont pas encore soumis le rapport de la période écoulée. Chaque relance n'est envoyée qu'une fois.
 */
export async function relancerRapports(payload: Payload, maintenant = new Date()): Promise<number> {
  const { docs: modeles } = await payload.find({
    collection: 'modeles-rapport',
    where: { and: [{ actif: { not_equals: false } }, { periodicite: { not_equals: 'ponctuel' } }] },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  let envoyees = 0
  for (const m of modeles) {
    const periode = periodeARendre(m.periodicite, maintenant)
    const limite = periode ? echeance(periode, m.jourLimite ?? 5) : null
    if (!periode || !limite) continue
    const reste = joursRestants(limite, maintenant)
    if (reste !== 3 && reste !== 0) continue
    const cle = `${periode}|J-${reste}`
    const deja = Array.isArray(m.relances) ? (m.relances as string[]) : []
    if (deja.includes(cle)) continue

    const { docs: rendus } = await payload.find({
      collection: 'rapports',
      where: { and: [{ modele: { equals: m.id } }, { periode: { equals: periode } }, { statut: { in: ['soumis', 'valide'] } }] },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    const ontRendu = new Set(rendus.map((r) => id(r.auteur)))
    const enAttente = (await auteursDe(payload, m)).filter((u) => !ontRendu.has(u.id))
    await notifier(payload, {
      destinataires: enAttente.map((u) => u.id),
      titre: reste === 0 ? `À rendre aujourd’hui : ${m.titre}` : `À rendre dans 3 jours : ${m.titre}`,
      texte: `Période : ${libellePeriode(periode)}`,
      lien: '/espace/rapports',
      type: 'systeme',
    })
    envoyees += enAttente.length
    await payload.update({ collection: 'modeles-rapport', id: m.id, data: { relances: [...deja, cle].slice(-24) }, overrideAccess: true })
  }
  return envoyees
}
