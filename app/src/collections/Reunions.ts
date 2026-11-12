import type { Access, CollectionConfig } from 'payload'

import { estBureau, estOrganisateur, membreEquipe } from '../access'
import { notifier } from '../lib/notifier'
import { convies, envoyerRappels, heureDakar } from '../lib/rappels'
import { relancerRapports } from '../lib/rapports'

/** Modifier une réunion (compte rendu compris) : son organisateur, le bureau, les administrateurs */
const peutModifier: Access = ({ req: { user } }) => {
  if (!user) return false
  if (estBureau(user)) return true
  return { organisateur: { equals: user.id } }
}

/** Réunions de l'équipe : planification, ordre du jour, participants, compte rendu */
export const Reunions: CollectionConfig = {
  slug: 'reunions',
  labels: { singular: 'Réunion', plural: 'Réunions' },
  admin: {
    group: 'Espace pro',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'debut', 'lieu', 'organisateur'],
    description: 'Les réunions de l’équipe, planifiées dans l’espace pro (/espace/reunions). Rappel le matin du jour et la veille.',
  },
  access: {
    read: membreEquipe,
    create: ({ req: { user } }) => estOrganisateur(user),
    update: peutModifier,
    delete: peutModifier,
  },
  hooks: {
    beforeChange: [({ data, operation, req }) => (operation === 'create' && req.user ? { ...data, organisateur: req.user.id } : data)],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        try {
          const auteur = req.user?.id
          await notifier(req.payload, {
            destinataires: (await convies(req.payload, doc)).filter((d) => d !== auteur),
            titre: `Réunion : ${doc.titre}`,
            texte: `${heureDakar(doc.debut)}${doc.lieu ? ` · ${doc.lieu}` : ''}`,
            lien: `/espace/reunions/${doc.id}`,
            type: 'reunion',
          })
        } catch (e) {
          req.payload.logger.error({ err: e }, 'Notification de réunion impossible')
        }
        return doc
      },
    ],
  },
  endpoints: [
    {
      // GET /api/reunions/rappels : rappels des réunions du jour et du lendemain, relances des rapports, appelé chaque matin par la tâche planifiée
      // (Vercel Cron, ou crontab sur un serveur). Sans effet en double : chaque rappel n'est envoyé qu'une fois.
      path: '/rappels',
      method: 'get',
      handler: async (req) => {
        const secret = process.env.CRON_SECRET
        const autorise =
          estBureau(req.user) ||
          (secret ? req.headers.get('authorization') === `Bearer ${secret}` : /vercel-cron/.test(req.headers.get('user-agent') ?? ''))
        if (!autorise) return Response.json({ message: 'Non autorisé' }, { status: 401 })
        return Response.json({ ...(await envoyerRappels(req.payload)), relancesRapports: await relancerRapports(req.payload) })
      },
    },
  ],
  defaultSort: '-debut',
  fields: [
    { name: 'titre', type: 'text', required: true, maxLength: 160 },
    {
      type: 'row',
      fields: [
        { name: 'debut', type: 'date', label: 'Date et heure', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMMM yyyy, HH:mm' } } },
        { name: 'duree', type: 'number', label: 'Durée (minutes)', defaultValue: 60, min: 15, max: 600 },
        { name: 'lieu', type: 'text', admin: { description: 'Ex. : siège, Fass Diaé. Visio : au lot suivant.' } },
      ],
    },
    { name: 'ordreDuJour', type: 'textarea', label: 'Ordre du jour', maxLength: 4000 },
    { name: 'touteLEquipe', type: 'checkbox', label: 'Toute l’équipe est conviée', defaultValue: true },
    { name: 'participants', type: 'relationship', relationTo: 'users', hasMany: true, admin: { condition: (d) => !d?.touteLEquipe } },
    { name: 'compteRendu', type: 'textarea', label: 'Compte rendu', maxLength: 20000 },
    { name: 'organisateur', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    // Rappels envoyés (pour n'envoyer chaque rappel qu'une fois)
    { name: 'rappelVeille', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
    { name: 'rappelJour', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
  ],
}
