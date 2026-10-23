import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'

export const TYPES_STRUCTURE = [
  { label: 'Financement', value: 'financement' },
  { label: 'Accompagnement des entreprises', value: 'accompagnement' },
  { label: 'Emploi', value: 'emploi' },
  { label: 'Formation professionnelle', value: 'formation' },
] as const

export const Structures: CollectionConfig = {
  slug: 'structures',
  labels: { singular: 'Structure', plural: 'Structures d’accompagnement' },
  admin: {
    group: 'Opportunités et formations',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'sigle', 'type', 'ordre'],
    description:
      'Annuaire des structures qui financent, accompagnent, emploient ou forment. Affiché dans « Opportunités » (et « Se former » pour la formation).',
  },
  hooks: hooksRegeneration,
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'ordre',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'sigle', type: 'text', admin: { width: '25%' } },
        { name: 'nom', type: 'text', localized: true, required: true, label: 'Nom complet' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'type', type: 'select', required: true, options: [...TYPES_STRUCTURE] },
        { name: 'ordre', type: 'number', defaultValue: 10 },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      required: true,
      maxLength: 400,
      admin: { description: 'Ce que la structure propose, en langage simple.' },
    },
    {
      name: 'aKolda',
      type: 'textarea',
      localized: true,
      label: 'Présence à Kolda',
      admin: { description: 'Antenne, actions récentes dans la région… Uniquement des informations vérifiées.' },
    },
    { name: 'source', type: 'text', label: 'Source (présence à Kolda)', admin: { description: 'Lien vers l’article ou le document.' } },
    { name: 'siteWeb', type: 'text', label: 'Site web' },
  ],
}
