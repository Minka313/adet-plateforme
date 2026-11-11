import type { CollectionConfig } from 'payload'

import { hooksRegeneration } from '../hooks/revalider'

import { anyone, equipeSite } from '../access'

export const Departements: CollectionConfig = {
  slug: 'departements',
  labels: { singular: 'Département ADET', plural: 'Départements ADET' },
  admin: {
    group: "L'association",
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'sigle', 'ordre'],
    description: "Organisation interne de l'association (Coordination, DFDC, DPS…).",
  },
  hooks: hooksRegeneration,
  access: { read: anyone, create: equipeSite, update: equipeSite, delete: equipeSite },
  defaultSort: 'ordre',
  fields: [
    { name: 'nom', localized: true, type: 'text', required: true },
    { name: 'sigle', type: 'text' },
    {
      name: 'missions',
      type: 'array',
      labels: { singular: 'Mission', plural: 'Missions' },
      fields: [{ name: 'texte', localized: true, type: 'text', required: true }],
    },
    { name: 'ordre', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
