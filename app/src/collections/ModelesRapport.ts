import type { CollectionConfig } from 'payload'

import { estBureau, membreEquipe, ROLES } from '../access'

/**
 * Modèles de rapport, définis par le directeur (bureau) : rubriques, rythme, jour limite,
 * qui doit rendre (rôles, pôles, personnes) et qui valide (par défaut le bureau).
 */
export const ModelesRapport: CollectionConfig = {
  slug: 'modeles-rapport',
  typescript: { interface: 'ModeleRapport' },
  labels: { singular: 'Modèle de rapport', plural: 'Modèles de rapport' },
  admin: {
    group: 'Espace pro',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'periodicite', 'actif'],
    description: 'Les rapports que l’équipe doit rendre. Le bureau les règle dans l’espace pro (/espace/rapports/modeles).',
  },
  access: {
    read: membreEquipe,
    create: ({ req: { user } }) => estBureau(user),
    update: ({ req: { user } }) => estBureau(user),
    delete: ({ req: { user } }) => estBureau(user),
  },
  fields: [
    { name: 'titre', type: 'text', required: true, maxLength: 120 },
    { name: 'description', type: 'textarea', maxLength: 600 },
    {
      type: 'row',
      fields: [
        {
          name: 'periodicite',
          type: 'select',
          label: 'Rythme',
          required: true,
          defaultValue: 'mensuel',
          options: [
            { label: 'Chaque mois', value: 'mensuel' },
            { label: 'Chaque trimestre', value: 'trimestriel' },
            { label: 'Après chaque activité', value: 'ponctuel' },
          ],
        },
        {
          name: 'jourLimite',
          type: 'number',
          label: 'Jour limite',
          defaultValue: 5,
          min: 1,
          max: 28,
          admin: { description: 'Jour du mois suivant la période (5 : le rapport d’octobre est dû le 5 novembre).' },
        },
        { name: 'actif', type: 'checkbox', defaultValue: true, admin: { description: 'Décocher pour ne plus le demander.' } },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Rubriques',
      required: true,
      minRows: 1,
      maxRows: 15,
      fields: [
        { name: 'intitule', type: 'text', required: true, maxLength: 120 },
        { name: 'aide', type: 'text', maxLength: 200, admin: { description: 'Une indication pour la personne qui rédige.' } },
        { name: 'obligatoire', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'rolesAuteurs', type: 'select', hasMany: true, label: 'Doivent rendre : par rôle', options: ROLES.map((r) => ({ ...r })) },
    { name: 'polesAuteurs', type: 'relationship', relationTo: 'departements', hasMany: true, label: 'Doivent rendre : par pôle' },
    { name: 'personnesAuteurs', type: 'relationship', relationTo: 'users', hasMany: true, label: 'Doivent rendre : nommément' },
    {
      name: 'validateurs',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: { description: 'Laisser vide : le bureau valide.' },
    },
    // Relances déjà envoyées (« 2026-10|J-3 »), pour n'en envoyer chacune qu'une fois
    { name: 'relances', type: 'json', admin: { hidden: true } },
  ],
}
