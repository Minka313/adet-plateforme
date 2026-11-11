import type { CollectionConfig } from 'payload'

import { estBureau, membreEquipe } from '../access'

/** Annonces internes de l'espace pro : le bureau informe toute l'équipe (réunions, consignes, nouvelles). */
export const Annonces: CollectionConfig = {
  slug: 'annonces',
  labels: { singular: 'Annonce interne', plural: 'Annonces internes' },
  admin: {
    group: 'Espace pro',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'auteur', 'epinglee', 'createdAt'],
    description: 'Messages du bureau à toute l’équipe, affichés dans l’espace pro. Une annonce épinglée reste en tête.',
  },
  access: {
    read: membreEquipe,
    create: ({ req: { user } }) => estBureau(user),
    update: ({ req: { user } }) => estBureau(user),
    delete: ({ req: { user } }) => estBureau(user),
  },
  hooks: {
    // L'auteur est toujours la personne connectée, jamais une valeur envoyée par le formulaire
    beforeChange: [({ data, operation, req }) => (operation === 'create' && req.user ? { ...data, auteur: req.user.id } : data)],
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'titre', type: 'text', required: true, maxLength: 140 },
    { name: 'contenu', type: 'textarea', required: true, maxLength: 4000 },
    { name: 'epinglee', type: 'checkbox', label: 'Épinglée', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'auteur', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar', readOnly: true } },
  ],
}
