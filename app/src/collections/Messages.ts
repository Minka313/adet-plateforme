import type { CollectionConfig } from 'payload'

import { loggedIn } from '../access'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message reçu', plural: 'Messages reçus' },
  admin: {
    group: 'Administration',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'objet', 'createdAt', 'traite'],
    description: 'Messages envoyés depuis le formulaire de contact du site.',
  },
  // Création uniquement via le formulaire du site (server action avec overrideAccess)
  access: { read: loggedIn, create: () => false, update: loggedIn, delete: loggedIn },
  defaultSort: '-createdAt',
  fields: [
    { name: 'nom', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'telephone', type: 'text', label: 'Téléphone' },
    {
      name: 'objet',
      type: 'select',
      options: [
        { label: "Demande d'information", value: 'information' },
        { label: 'Devenir partenaire', value: 'partenariat' },
        { label: 'Adhérer / bénévolat', value: 'adhesion' },
        { label: 'Formations', value: 'formation' },
        { label: 'Autre', value: 'autre' },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    { name: 'traite', type: 'checkbox', label: 'Traité', admin: { position: 'sidebar' } },
  ],
}
