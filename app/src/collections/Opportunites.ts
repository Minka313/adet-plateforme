import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { loggedIn, publishedOrLoggedIn } from '../access'

export const TYPES_OPPORTUNITE = [
  { label: 'Financement', value: 'financement' },
  { label: 'Appel à projets', value: 'appel-a-projets' },
  { label: 'Emploi ou stage', value: 'emploi' },
  { label: 'Formation', value: 'formation' },
  { label: 'Concours / prix', value: 'concours' },
] as const

export const Opportunites: CollectionConfig = {
  slug: 'opportunites',
  labels: { singular: 'Opportunité', plural: 'Opportunités' },
  admin: {
    group: 'Opportunités et formations',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'type', 'dateLimite', '_status'],
    description:
      'Financements, appels à projets, emplois… Chaque opportunité disparaît automatiquement du site après sa date limite.',
  },
  versions: { drafts: true },
  hooks: hooksRegeneration,
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'dateLimite',
  fields: [
    { name: 'titre', type: 'text', localized: true, required: true },
    {
      type: 'row',
      fields: [
        { name: 'type', type: 'select', required: true, options: [...TYPES_OPPORTUNITE] },
        {
          name: 'dateLimite',
          type: 'date',
          label: 'Date limite',
          required: true,
          admin: { date: { displayFormat: 'd MMMM yyyy' }, description: 'Après cette date, l’opportunité n’est plus affichée.' },
        },
      ],
    },
    {
      name: 'resume',
      type: 'textarea',
      localized: true,
      label: 'Description',
      required: true,
      maxLength: 500,
    },
    { name: 'publicCible', type: 'text', localized: true, label: 'Pour qui ?', admin: { description: 'Ex. : jeunes de 18 à 35 ans de la région de Kolda.' } },
    {
      type: 'row',
      fields: [
        { name: 'structure', type: 'relationship', relationTo: 'structures', label: 'Proposée par' },
        { name: 'lien', type: 'text', label: 'Lien pour postuler ou s’informer', required: true },
      ],
    },
  ],
}
