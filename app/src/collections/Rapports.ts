import { APIError, type Access, type CollectionConfig, type Where } from 'payload'

import { estBureau } from '../access'
import { notifier } from '../lib/notifier'
import { libellePeriode } from '../lib/periodes'
import { estAuteur, estValidateur, idsValidateurs } from '../lib/rapports'
import type { ModeleRapport } from '../payload-types'

const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null | undefined))

/** Lire un rapport : son auteur, ses validateurs, le bureau */
const lecteurs: Access = ({ req: { user } }) => {
  if (!user) return false
  if (estBureau(user)) return true
  const lesSiens: Where = { or: [{ auteur: { equals: user.id } }, { validateurs: { in: [user.id] } }] }
  return lesSiens
}

export const STATUTS_RAPPORT = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Soumis', value: 'soumis' },
  { label: 'À corriger', value: 'a-corriger' },
  { label: 'Validé', value: 'valide' },
] as const

const refus = (message: string) => new APIError(message, 403, undefined, true)

/**
 * Rapports d'activité : l'auteur rédige et soumet, un validateur valide ou demande des corrections.
 * Les passages d'un statut à l'autre sont contrôlés ici, quel que soit l'écran utilisé.
 */
export const Rapports: CollectionConfig = {
  slug: 'rapports',
  labels: { singular: 'Rapport', plural: 'Rapports' },
  admin: {
    group: 'Espace pro',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'auteur', 'statut', 'soumisLe'],
    description: 'Rédigés et validés dans l’espace pro (/espace/rapports).',
  },
  access: { read: lecteurs, create: ({ req: { user } }) => Boolean(user), update: lecteurs, delete: ({ req: { user } }) => estBureau(user) },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const user = req.user
        // Les scripts du serveur (sans personne connectée) ne passent pas par ces règles
        if (!user) return data
        const modele = (await req.payload.findByID({ collection: 'modeles-rapport', id: id(data.modele ?? originalDoc?.modele)!, depth: 0, overrideAccess: true })) as ModeleRapport

        if (operation === 'create') {
          if (!estAuteur(modele, user)) throw refus('Ce rapport ne vous est pas demandé.')
          const periode = String(data.periode ?? '').trim()
          if (!periode) throw refus('Indiquez la période ou l’activité concernée.')
          if (modele.periodicite !== 'ponctuel') {
            const deja = await req.payload.count({
              collection: 'rapports',
              where: { and: [{ modele: { equals: modele.id } }, { auteur: { equals: user.id } }, { periode: { equals: periode } }] },
              overrideAccess: true,
            })
            if (deja.totalDocs) throw refus('Vous avez déjà un rapport pour cette période.')
          }
          const statut = data.statut === 'soumis' ? 'soumis' : 'brouillon'
          return {
            ...data,
            periode,
            statut,
            auteur: user.id,
            titre: `${modele.titre} · ${libellePeriode(periode)}`,
            validateurs: await idsValidateurs(req.payload, modele),
            soumisLe: statut === 'soumis' ? new Date().toISOString() : undefined,
          }
        }

        const avant = originalDoc?.statut
        const apres = data.statut ?? avant
        const estSonAuteur = id(originalDoc?.auteur) === user.id
        const valide = estValidateur(modele, user)
        // Le modèle, l'auteur et la période ne changent jamais après la création
        const fixe = { modele: originalDoc?.modele, auteur: originalDoc?.auteur, periode: originalDoc?.periode, titre: originalDoc?.titre, validateurs: originalDoc?.validateurs }

        if (estSonAuteur && (avant === 'brouillon' || avant === 'a-corriger') && (apres === 'brouillon' || apres === 'soumis')) {
          return { ...data, ...fixe, statut: apres, commentaire: originalDoc?.commentaire, soumisLe: apres === 'soumis' ? new Date().toISOString() : originalDoc?.soumisLe }
        }
        if (valide && avant === 'soumis' && (apres === 'valide' || apres === 'a-corriger')) {
          if (apres === 'a-corriger' && !String(data.commentaire ?? '').trim()) throw refus('Expliquez ce qu’il faut corriger.')
          // Le validateur ne réécrit pas le rapport : il ne change que le statut et le commentaire
          return {
            ...data,
            ...fixe,
            reponses: originalDoc?.reponses,
            statut: apres,
            commentaire: String(data.commentaire ?? '').trim(),
            validePar: user.id,
            valideLe: apres === 'valide' ? new Date().toISOString() : undefined,
          }
        }
        throw refus(avant === 'valide' ? 'Ce rapport est déjà validé.' : 'Vous ne pouvez pas modifier ce rapport à cette étape.')
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'update' && previousDoc?.statut === doc.statut) return doc
        try {
          const lien = `/espace/rapports/${doc.id}`
          const auteur = id(doc.auteur)
          if (doc.statut === 'soumis') {
            const nom = typeof doc.auteur === 'object' ? doc.auteur?.nom : req.user?.nom
            await notifier(req.payload, {
              destinataires: (Array.isArray(doc.validateurs) ? doc.validateurs.map(id) : []).filter((v: unknown) => v !== auteur),
              titre: `Rapport à valider : ${doc.titre}`,
              texte: nom ? `Soumis par ${nom}` : undefined,
              lien,
              type: 'systeme',
            })
          } else if (doc.statut === 'valide' || doc.statut === 'a-corriger') {
            await notifier(req.payload, {
              destinataires: [auteur],
              titre: doc.statut === 'valide' ? `Rapport validé : ${doc.titre}` : `Rapport à corriger : ${doc.titre}`,
              texte: doc.statut === 'a-corriger' ? String(doc.commentaire ?? '').slice(0, 140) : undefined,
              lien,
              type: 'systeme',
            })
          }
        } catch (e) {
          req.payload.logger.error({ err: e }, 'Notification de rapport impossible')
        }
        return doc
      },
    ],
  },
  defaultSort: '-updatedAt',
  fields: [
    { name: 'titre', type: 'text', admin: { readOnly: true } },
    { name: 'modele', type: 'relationship', relationTo: 'modeles-rapport', required: true, index: true },
    { name: 'periode', type: 'text', required: true, index: true, admin: { description: '« 2026-10 », « 2026-T3 », ou le nom de l’activité.' } },
    { name: 'auteur', type: 'relationship', relationTo: 'users', index: true, admin: { readOnly: true } },
    {
      name: 'reponses',
      type: 'array',
      fields: [
        { name: 'intitule', type: 'text', required: true },
        { name: 'valeur', type: 'textarea', maxLength: 10000 },
      ],
    },
    { name: 'statut', type: 'select', options: [...STATUTS_RAPPORT], defaultValue: 'brouillon', required: true, index: true },
    { name: 'commentaire', type: 'textarea', label: 'Commentaire du validateur', maxLength: 4000 },
    { name: 'validateurs', type: 'relationship', relationTo: 'users', hasMany: true, admin: { readOnly: true } },
    { name: 'validePar', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'soumisLe', type: 'date', admin: { readOnly: true } },
    { name: 'valideLe', type: 'date', admin: { readOnly: true } },
  ],
}
