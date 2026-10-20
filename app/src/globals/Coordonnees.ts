import type { GlobalConfig } from 'payload'

import { revaliderGlobal } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'

export const Coordonnees: GlobalConfig = {
  slug: 'coordonnees',
  label: 'Coordonnées et réseaux',
  admin: { group: "L'association" },
  hooks: { afterChange: [revaliderGlobal] },
  access: { read: anyone, update: loggedIn },
  fields: [
    { name: 'adresse', type: 'textarea' },
    { name: 'email', type: 'email' },
    {
      name: 'telephones',
      type: 'array',
      label: 'Téléphones',
      labels: { singular: 'Téléphone', plural: 'Téléphones' },
      fields: [{ name: 'numero', type: 'text', required: true }],
    },
    {
      name: 'whatsapp',
      type: 'text',
      label: 'Numéro WhatsApp',
      admin: { description: 'Format international sans espaces, ex. 221769412325.' },
    },
    {
      name: 'reseaux',
      type: 'array',
      label: 'Réseaux sociaux',
      labels: { singular: 'Réseau', plural: 'Réseaux' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'reseau',
              type: 'select',
              required: true,
              options: ['Facebook', 'LinkedIn', 'X', 'Instagram', 'YouTube', 'TikTok'].map((r) => ({
                label: r,
                value: r.toLowerCase(),
              })),
            },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'recepisse', type: 'text', label: 'N° de reconnaissance' },
        { name: 'ninea', type: 'text', label: 'NINEA' },
      ],
    },
  ],
}
