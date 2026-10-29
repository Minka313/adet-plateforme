import type { CollectionConfig } from 'payload'

import { loggedIn } from '../access'
import { notifierInscription } from '../hooks/notifierInscription'

const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export const STATUTS_INSCRIPTION = [
  { label: 'À traiter', value: 'recue' },
  { label: 'Confirmée', value: 'confirmee' },
  { label: 'Liste d’attente', value: 'attente' },
  { label: 'Annulée', value: 'annulee' },
] as const

export const Inscriptions: CollectionConfig = {
  slug: 'inscriptions',
  labels: { singular: 'Inscription', plural: 'Inscriptions aux formations' },
  admin: {
    group: 'Opportunités et formations',
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'session', 'telephone', 'statut', 'createdAt'],
    description:
      'Demandes d’inscription reçues depuis le site. Appelez ou écrivez à la personne, puis changez son statut. Une inscription annulée libère sa place.',
  },
  hooks: { afterChange: [notifierInscription] },
  // Création uniquement via le formulaire du site (server action avec overrideAccess)
  access: { read: loggedIn, create: () => false, update: loggedIn, delete: loggedIn },
  defaultSort: '-createdAt',
  fields: [
    { name: 'session', type: 'relationship', relationTo: 'sessions', required: true, index: true },
    {
      type: 'row',
      fields: [
        { name: 'nom', type: 'text', label: 'Nom et prénom', required: true },
        { name: 'telephone', type: 'text', label: 'Téléphone', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'E-mail' },
        { name: 'commune', type: 'text', label: 'Commune' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sexe',
          type: 'select',
          options: [
            { label: 'Femme', value: 'femme' },
            { label: 'Homme', value: 'homme' },
          ],
          admin: { description: 'Facultatif : sert au suivi des femmes formées.' },
        },
        { name: 'age', type: 'number', label: 'Âge', admin: { description: 'Facultatif : sert au suivi des jeunes formés.' } },
      ],
    },
    { name: 'motivation', type: 'textarea', label: 'Activité ou projet' },
    {
      name: 'statut',
      type: 'select',
      defaultValue: 'recue',
      required: true,
      index: true,
      options: [...STATUTS_INSCRIPTION],
      admin: { position: 'sidebar' },
    },
    { name: 'langue', type: 'select', options: ['fr', 'en'], admin: { position: 'sidebar', readOnly: true } },
    // Empreinte anonyme de l'expéditeur, utilisée uniquement contre les envois en rafale
    { name: 'empreinte', type: 'text', index: true, admin: { hidden: true } },
  ],
  endpoints: [
    {
      // GET /api/inscriptions/export?session=12 → liste des inscrits en CSV (membres connectés uniquement)
      path: '/export',
      method: 'get',
      handler: async (req) => {
        if (!req.user) return Response.json({ message: 'Non autorisé' }, { status: 401 })
        const session = Number(new URL(req.url ?? '', 'http://x').searchParams.get('session'))
        const { docs } = await req.payload.find({
          collection: 'inscriptions',
          where: session ? { session: { equals: session } } : {},
          sort: 'createdAt',
          limit: 0,
          pagination: false,
          depth: 1,
          locale: 'fr',
        })
        const statut = (v: string) => STATUTS_INSCRIPTION.find((s) => s.value === v)?.label ?? v
        const lignes = [
          'session,nom,telephone,email,commune,sexe,age,activite,statut,date_demande',
          ...docs.map((d) =>
            [
              typeof d.session === 'object' ? d.session.titre : d.session,
              d.nom,
              d.telephone,
              d.email,
              d.commune,
              d.sexe,
              d.age,
              d.motivation,
              statut(d.statut),
              d.createdAt,
            ]
              .map(csv)
              .join(','),
          ),
        ]
        return new Response('﻿' + lignes.join('\n'), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="inscriptions-adet${session ? `-session-${session}` : ''}-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        })
      },
    },
  ],
}
