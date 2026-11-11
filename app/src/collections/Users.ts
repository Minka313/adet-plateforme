import { APIError, type CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, estEquipeSite, isAdmin, ROLES } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Compte', plural: 'Comptes de l’équipe' },
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'email', 'roles', 'pole', 'actif'],
    group: 'Administration',
    description:
      'Chaque membre de l’équipe a son compte. Administrateurs et éditeurs ouvrent ce back-office ; tous ouvrent l’espace pro (/espace).',
  },
  auth: {
    // 5 essais ratés → compte verrouillé 15 min ; session de 8 h
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  access: {
    // Le back-office est réservé à l'équipe du site ; les autres membres travaillent dans l'espace pro
    admin: ({ req: { user } }) => estEquipeSite(user),
    // Le premier compte peut être créé sans être connecté (écran « create-first-user »).
    create: async ({ req }) => {
      if (isAdmin(req.user)) return true
      const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
      return totalDocs === 0
    },
    // L'annuaire de l'équipe : chaque membre connecté voit les autres comptes
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    delete: adminOnly,
  },
  hooks: {
    // Le tout premier compte d'une installation devient administrateur
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        if (totalDocs === 0) return { ...data, roles: ['admin'], actif: true }
        return data
      },
    ],
    // Un compte désactivé ne peut plus se connecter (départ d'un membre), sans perdre son historique
    beforeLogin: [
      ({ user }) => {
        if (user.actif === false) throw new APIError('Ce compte a été désactivé. Contactez un administrateur de l’ADET.', 403, undefined, true)
        return user
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'nom', type: 'text', label: 'Nom complet' },
        { name: 'fonction', type: 'text', label: 'Fonction', admin: { description: 'Ex. : Chargée de communication' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'pole', type: 'relationship', relationTo: 'departements', label: 'Pôle' },
        { name: 'telephone', type: 'text', label: 'Téléphone', admin: { description: 'Ex. : 77 458 61 05. Visible par l’équipe uniquement.' } },
      ],
    },
    {
      name: 'roles',
      type: 'select',
      label: 'Rôles',
      hasMany: true,
      // Moindre privilège : un nouveau compte est membre de l'équipe, sans accès aux contenus du site
      defaultValue: ['membre'],
      saveToJWT: true,
      options: [...ROLES],
      access: { update: adminOnlyField },
      admin: {
        description:
          'Administrateur : tout, comptes compris. Éditeur : contenus du site. Bureau : annonces et validations. Responsable : son pôle. Membre : l’espace pro.',
      },
    },
    {
      name: 'actif',
      type: 'checkbox',
      label: 'Compte actif',
      defaultValue: true,
      access: { update: adminOnlyField },
      admin: { position: 'sidebar', description: 'Décocher quand une personne quitte l’équipe : elle ne peut plus se connecter.' },
    },
  ],
}
