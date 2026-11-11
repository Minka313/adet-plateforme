import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access'

/**
 * Téléphones et ordinateurs qui reçoivent les notifications push (Web Push).
 * Enregistrés par l'espace pro (/espace/notifications/abonnement), jamais par l'API publique ;
 * un abonnement expiré (réponse 404 ou 410 du service push) est supprimé automatiquement.
 */
export const AbonnementsPush: CollectionConfig = {
  slug: 'abonnements-push',
  labels: { singular: 'Appareil notifié', plural: 'Appareils notifiés' },
  admin: {
    group: 'Administration',
    useAsTitle: 'appareil',
    defaultColumns: ['utilisateur', 'appareil', 'createdAt'],
    description: 'Appareils où un membre a activé les notifications. Supprimer une ligne arrête les notifications sur cet appareil.',
  },
  access: { read: adminOnly, delete: adminOnly, create: () => false, update: () => false },
  fields: [
    { name: 'utilisateur', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'endpoint', type: 'text', required: true, unique: true, index: true },
    { name: 'p256dh', type: 'text', required: true, admin: { hidden: true } },
    { name: 'auth', type: 'text', required: true, admin: { hidden: true } },
    { name: 'appareil', type: 'text', admin: { description: 'Navigateur et système, pour reconnaître l’appareil.' } },
  ],
}
