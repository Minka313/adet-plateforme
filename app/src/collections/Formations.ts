import type { CollectionConfig } from 'payload'

import { empecherSiLie } from '../hooks/empecherSuppression'
import { hooksRegeneration } from '../hooks/revalider'

import { loggedIn, publishedOrLoggedIn } from '../access'

export const Formations: CollectionConfig = {
  slug: 'formations',
  labels: { singular: 'Formation', plural: 'Formations de l’ADET' },
  admin: {
    group: 'Opportunités et formations',
    useAsTitle: 'titre',
    defaultColumns: ['titre', '_status', 'updatedAt'],
    description: 'Le catalogue des formations proposées par l’ADET (axe 1 : renforcement de capacités).',
  },
  versions: { drafts: true },
  hooks: {
    ...hooksRegeneration,
    beforeDelete: [empecherSiLie('sessions', 'formation', 'Cette formation a des sessions. Supprimez d’abord ses sessions, ou repassez-la en brouillon pour la retirer du site.')],
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'titre',
  fields: [
    { name: 'titre', type: 'text', localized: true, required: true },
    { name: 'resume', type: 'textarea', localized: true, label: 'Objectifs', required: true, maxLength: 500 },
    {
      type: 'row',
      fields: [
        { name: 'publicCible', type: 'text', localized: true, label: 'Public' },
        { name: 'duree', type: 'text', localized: true, label: 'Durée', admin: { description: 'Ex. : 3 jours' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'lieu', type: 'text', label: 'Lieu' },
        { name: 'cout', type: 'text', localized: true, label: 'Coût', admin: { description: 'Ex. : gratuit, 10 000 FCFA' } },
      ],
    },
    {
      name: 'sessions',
      type: 'join',
      collection: 'sessions',
      on: 'formation',
      label: 'Sessions',
      admin: { description: 'Les dates de cette formation. Ajoutez-en depuis « Sessions de formation ».', defaultColumns: ['dateDebut', 'lieu', 'places', 'inscriptionsOuvertes'] },
    },
  ],
}
