import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'

export const Equipe: CollectionConfig = {
  slug: 'equipe',
  labels: { singular: "Membre de l'équipe", plural: 'Équipe' },
  admin: {
    group: "L'association",
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'fonction', 'departement', 'ordre'],
  },
  hooks: hooksRegeneration,
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'ordre',
  fields: [
    { name: 'nom', type: 'text', required: true },
    { name: 'fonction', localized: true, type: 'text', required: true },
    { name: 'departement', type: 'relationship', relationTo: 'departements', label: 'Département' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', localized: true, type: 'textarea', label: 'Courte présentation' },
    { name: 'ordre', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
