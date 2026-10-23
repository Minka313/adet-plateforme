import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { loggedIn, publishedOrLoggedIn } from '../access'

export const Formations: CollectionConfig = {
  slug: 'formations',
  labels: { singular: 'Formation', plural: 'Formations de l’ADET' },
  admin: {
    group: 'Opportunités et formations',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'prochaineSession', '_status'],
    description: 'Le catalogue des formations proposées par l’ADET (axe 1 : renforcement de capacités).',
  },
  versions: { drafts: true },
  hooks: hooksRegeneration,
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'prochaineSession',
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
      name: 'prochaineSession',
      type: 'date',
      label: 'Prochaine session',
      admin: { date: { displayFormat: 'd MMMM yyyy' }, description: 'Laisser vide si aucune date n’est encore fixée.' },
    },
    {
      name: 'inscriptionsOuvertes',
      type: 'checkbox',
      label: 'Inscriptions ouvertes',
      defaultValue: false,
      admin: { description: 'Affiche le bouton « S’inscrire » (formulaire de contact, objet Formations).' },
    },
  ],
}
