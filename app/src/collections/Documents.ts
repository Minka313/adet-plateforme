import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { anyone, equipeSite } from '../access'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  admin: {
    group: 'Médias et documents',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'categorie', 'annee'],
    description: 'Rapports, statuts, plaquettes… téléchargeables depuis le site.',
  },
  hooks: hooksRegeneration,
  access: { read: anyone, create: equipeSite, update: equipeSite, delete: equipeSite },
  upload: { mimeTypes: ['application/pdf', 'image/*'] },
  defaultSort: '-annee',
  fields: [
    { name: 'titre', localized: true, type: 'text', required: true },
    {
      name: 'categorie',
      type: 'select',
      label: 'Catégorie',
      defaultValue: 'rapport',
      options: [
        { label: "Rapport d'activité", value: 'rapport' },
        { label: 'Document institutionnel', value: 'institutionnel' },
        { label: 'Étude', value: 'etude' },
        { label: 'Plaquette / présentation', value: 'plaquette' },
      ],
    },
    { name: 'annee', type: 'number', label: 'Année' },
    { name: 'description', localized: true, type: 'textarea' },
  ],
}
