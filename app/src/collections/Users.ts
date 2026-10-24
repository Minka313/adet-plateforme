import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['nom', 'email', 'roles'],
    group: 'Administration',
  },
  auth: {
    // 5 essais ratés → compte verrouillé 15 min ; session de 8 h
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  access: {
    // Le premier compte peut être créé sans être connecté (écran « create-first-user »).
    create: async ({ req }) => {
      if (isAdmin(req.user)) return true
      const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
      return totalDocs === 0
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    delete: adminOnly,
  },
  hooks: {
    // Le tout premier compte d'une installation devient administrateur ; les suivants sont éditeurs par défaut
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        if (totalDocs === 0) return { ...data, roles: ['admin'] }
        return data
      },
    ],
  },
  fields: [
    { name: 'nom', type: 'text', label: 'Nom complet' },
    {
      name: 'roles',
      type: 'select',
      label: 'Rôles',
      hasMany: true,
      // Moindre privilège : un nouveau compte est éditeur, sauf choix explicite d'un administrateur
      defaultValue: ['editeur'],
      saveToJWT: true,
      options: [
        { label: 'Administrateur', value: 'admin' },
        { label: 'Éditeur (contenus)', value: 'editeur' },
      ],
      access: { update: adminOnlyField },
      admin: {
        description: "L'administrateur gère aussi les comptes ; l'éditeur publie les contenus.",
      },
    },
  ],
}
