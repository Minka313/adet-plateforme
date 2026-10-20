import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const Partenaires: CollectionConfig = {
  slug: 'partenaires',
  labels: { singular: 'Partenaire', plural: 'Partenaires' },
  admin: {
    group: "L'association",
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'type', 'ordre'],
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'ordre',
  fields: [
    { name: 'nom', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'technique',
      options: [
        { label: 'Institution publique', value: 'public' },
        { label: 'Collectivité territoriale', value: 'collectivite' },
        { label: 'Partenaire technique et financier', value: 'technique' },
        { label: 'Organisation internationale', value: 'international' },
        { label: 'Secteur privé', value: 'prive' },
        { label: 'Société civile', value: 'societe-civile' },
      ],
    },
    { name: 'description', localized: true, type: 'textarea', label: 'Nature du partenariat' },
    { name: 'siteWeb', type: 'text', label: 'Site web' },
    { name: 'ordre', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
