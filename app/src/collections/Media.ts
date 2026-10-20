import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: { group: 'Contenus' },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    {
      name: 'alt', localized: true,
      type: 'text',
      label: "Description de l'image",
      required: true,
      admin: { description: 'Décrivez brièvement l’image (accessibilité et référencement).' },
    },
    { name: 'credit', type: 'text', label: 'Crédit photo' },
  ],
  upload: {
    // Formats légers pour les connexions lentes
    formatOptions: { format: 'webp', options: { quality: 78 } },
    imageSizes: [
      { name: 'vignette', width: 400, formatOptions: { format: 'webp', options: { quality: 72 } } },
      { name: 'carte', width: 800, formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'large', width: 1600, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
    resizeOptions: { width: 2000, withoutEnlargement: true },
    mimeTypes: ['image/*'],
  },
}
