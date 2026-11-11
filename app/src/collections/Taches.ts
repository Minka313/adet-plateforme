import type { Access, CollectionConfig, Where } from 'payload'

import { estBureau, membreEquipe } from '../access'
import { notifier } from '../lib/notifier'

const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null | undefined))
const ids = (v: unknown) => (Array.isArray(v) ? v.map(id).filter((x): x is number => typeof x === 'number') : [])

/** Modifier une tâche : son créateur, ses responsables, le bureau (et les administrateurs) */
const peutModifier: Access = ({ req: { user } }) => {
  if (!user) return false
  if (estBureau(user)) return true
  const lesSiennes: Where = { or: [{ creePar: { equals: user.id } }, { responsables: { in: [user.id] } }] }
  return lesSiennes
}

export const STATUTS_TACHE = [
  { label: 'À faire', value: 'a-faire' },
  { label: 'En cours', value: 'en-cours' },
  { label: 'Fait', value: 'fait' },
] as const

/** Tâches de l'équipe, suivies par pôle dans l'espace pro */
export const Taches: CollectionConfig = {
  slug: 'taches',
  typescript: { interface: 'Tache' },
  labels: { singular: 'Tâche', plural: 'Tâches' },
  admin: {
    group: 'Espace pro',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'statut', 'echeance', 'pole', 'responsables'],
    description: 'Les tâches de l’équipe. Elles se gèrent d’abord dans l’espace pro (/espace/taches).',
  },
  access: {
    read: membreEquipe,
    create: membreEquipe,
    update: peutModifier,
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (estBureau(user)) return true
      return { creePar: { equals: user.id } }
    },
  },
  hooks: {
    beforeChange: [({ data, operation, req }) => (operation === 'create' && req.user ? { ...data, creePar: req.user.id } : data)],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        try {
          const auteur = req.user?.id
          // Nouveaux responsables : prévenus qu'une tâche leur est confiée
          const avant = operation === 'create' ? [] : ids(previousDoc?.responsables)
          const nouveaux = ids(doc.responsables).filter((r) => !avant.includes(r) && r !== auteur)
          if (nouveaux.length) {
            await notifier(req.payload, {
              destinataires: nouveaux,
              titre: `Tâche confiée : ${doc.titre}`,
              texte: doc.echeance ? `À faire pour le ${new Date(doc.echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}` : undefined,
              lien: '/espace/taches',
              type: 'tache',
            })
          }
          // Tâche terminée : son créateur le sait
          const createur = id(doc.creePar)
          if (operation === 'update' && previousDoc?.statut !== 'fait' && doc.statut === 'fait' && createur && createur !== auteur) {
            await notifier(req.payload, { destinataires: [createur], titre: `Tâche terminée : ${doc.titre}`, lien: '/espace/taches', type: 'tache' })
          }
        } catch (e) {
          req.payload.logger.error({ err: e }, 'Notification de tâche impossible')
        }
        return doc
      },
    ],
  },
  defaultSort: 'echeance',
  fields: [
    { name: 'titre', type: 'text', required: true, maxLength: 160 },
    { name: 'description', type: 'textarea', maxLength: 4000 },
    {
      type: 'row',
      fields: [
        { name: 'statut', type: 'select', options: [...STATUTS_TACHE], defaultValue: 'a-faire', required: true, index: true },
        {
          name: 'priorite',
          type: 'select',
          label: 'Priorité',
          defaultValue: 'normale',
          required: true,
          options: [
            { label: 'Basse', value: 'basse' },
            { label: 'Normale', value: 'normale' },
            { label: 'Haute', value: 'haute' },
          ],
        },
        { name: 'echeance', type: 'date', label: 'Échéance', index: true, admin: { date: { displayFormat: 'd MMMM yyyy' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'responsables', type: 'relationship', relationTo: 'users', hasMany: true },
        { name: 'pole', type: 'relationship', relationTo: 'departements', label: 'Pôle', index: true },
      ],
    },
    { name: 'creePar', type: 'relationship', relationTo: 'users', label: 'Créée par', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
