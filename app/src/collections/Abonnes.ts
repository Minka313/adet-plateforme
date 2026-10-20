import type { CollectionConfig } from 'payload'

import { isAdmin, loggedIn } from '../access'

const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export const Abonnes: CollectionConfig = {
  slug: 'abonnes',
  labels: { singular: 'Abonné newsletter', plural: 'Abonnés newsletter' },
  admin: {
    group: 'Administration',
    useAsTitle: 'email',
    defaultColumns: ['email', 'langue', 'actif', 'createdAt'],
    description: 'Inscriptions à la lettre d’information depuis le site. Export CSV : bouton du tableau de bord.',
  },
  // Inscription uniquement via le formulaire du site (server action avec overrideAccess)
  access: { read: loggedIn, create: () => false, update: loggedIn, delete: ({ req }) => isAdmin(req.user) },
  defaultSort: '-createdAt',
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'langue', type: 'select', options: ['fr', 'en'], defaultValue: 'fr' },
    { name: 'actif', type: 'checkbox', defaultValue: true, admin: { description: 'Décocher en cas de désinscription.' } },
    { name: 'consentement', type: 'date', label: 'Date du consentement', admin: { readOnly: true } },
    { name: 'empreinte', type: 'text', index: true, admin: { hidden: true } },
  ],
  endpoints: [
    {
      // GET /api/abonnes/export → fichier CSV des abonnés actifs (membres connectés uniquement)
      path: '/export',
      method: 'get',
      handler: async (req) => {
        if (!req.user) return Response.json({ message: 'Non autorisé' }, { status: 401 })
        const { docs } = await req.payload.find({
          collection: 'abonnes',
          where: { actif: { equals: true } },
          limit: 0,
          pagination: false,
          depth: 0,
        })
        const lignes = ['email,langue,date_inscription', ...docs.map((d) => [d.email, d.langue, d.createdAt].map(csv).join(','))]
        return new Response('﻿' + lignes.join('\n'), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="abonnes-adet-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        })
      },
    },
  ],
}
