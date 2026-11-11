import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '../access'

/** Chacun ne voit et ne gère que ses propres notifications */
const lesSiennes: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { destinataire: { equals: user.id } }
}

export const TYPES_NOTIFICATION = [
  { label: 'Annonce', value: 'annonce' },
  { label: 'Inscription', value: 'inscription' },
  { label: 'Message', value: 'message' },
  { label: 'Tâche', value: 'tache' },
  { label: 'Réunion', value: 'reunion' },
  { label: 'Système', value: 'systeme' },
] as const

/** Centre de notifications de l'espace pro (la cloche). Créées par le serveur uniquement, via lib/notifier. */
export const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: { singular: 'Notification', plural: 'Notifications' },
  admin: {
    group: 'Espace pro',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'destinataire', 'type', 'lue', 'createdAt'],
    description: 'Envoyées automatiquement (annonces, inscriptions, messages…). Chacun voit les siennes dans l’espace pro.',
  },
  access: { read: lesSiennes, update: lesSiennes, delete: lesSiennes, create: () => false },
  defaultSort: '-createdAt',
  fields: [
    { name: 'destinataire', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'titre', type: 'text', required: true },
    { name: 'texte', type: 'textarea' },
    { name: 'lien', type: 'text', admin: { description: 'Adresse ouverte au clic (ex. /espace/annonces).' } },
    { name: 'type', type: 'select', options: [...TYPES_NOTIFICATION], defaultValue: 'systeme', required: true },
    { name: 'lue', type: 'checkbox', defaultValue: false, index: true },
  ],
}
