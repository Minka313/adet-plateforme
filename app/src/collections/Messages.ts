import type { CollectionConfig } from 'payload'

import { loggedIn } from '../access'
import { notifierMessage } from '../hooks/notifierMessage'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message reçu', plural: 'Messages reçus' },
  admin: {
    group: 'Administration',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'objet', 'createdAt', 'traite'],
    description: 'Messages envoyés depuis le formulaire de contact du site.',
  },
  hooks: { afterChange: [notifierMessage] },
  // Création uniquement via le formulaire du site (server action avec overrideAccess)
  access: { read: loggedIn, create: () => false, update: loggedIn, delete: loggedIn },
  defaultSort: '-createdAt',
  fields: [
    { name: 'nom', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'telephone', type: 'text', label: 'Téléphone' },
    { name: 'organisation', type: 'text' },
    {
      name: 'langue',
      type: 'select',
      options: ['fr', 'en'],
      admin: { position: 'sidebar', readOnly: true },
    },
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
    // Empreinte anonyme de l'expéditeur, utilisée uniquement contre les envois en rafale
    { name: 'empreinte', type: 'text', index: true, admin: { hidden: true } },
  ],
}
