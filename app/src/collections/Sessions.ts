import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { empecherSiLie } from '../hooks/empecherSuppression'
import { hooksRegeneration } from '../hooks/revalider'

import { anyone, loggedIn } from '../access'

/** Titre lisible dans le back-office : « Intitulé de la formation – 12 mars 2027 » */
const titrer: CollectionBeforeChangeHook = async ({ data, req }) => {
  const id = typeof data.formation === 'object' ? data.formation?.id : data.formation
  let intitule = 'Formation'
  if (id) {
    const f = await req.payload.findByID({ collection: 'formations', id, depth: 0, locale: 'fr', draft: true, req })
    intitule = f.titre
  }
  const date = data.dateDebut
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(data.dateDebut))
    : ''
  return { ...data, titre: date ? `${intitule} – ${date}` : intitule }
}

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  labels: { singular: 'Session de formation', plural: 'Sessions de formation' },
  admin: {
    group: 'Opportunités et formations',
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'lieu', 'places', 'inscriptionsOuvertes'],
    description:
      'Les dates de chaque formation. Une session passée disparaît du site ; les inscriptions se ferment seules quand les places sont prises.',
  },
  hooks: {
    ...hooksRegeneration,
    beforeChange: [titrer],
    beforeDelete: [
      empecherSiLie(
        'inscriptions',
        'session',
        'Cette session a reçu des inscriptions. Pour l’arrêter, décochez « Inscriptions ouvertes », ou supprimez d’abord ses inscriptions.',
      ),
    ],
  },
  // Les sessions d'une formation en brouillon ne sont jamais affichées : le site filtre sur la formation publiée
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'dateDebut',
  fields: [
    { name: 'titre', type: 'text', admin: { hidden: true } },
    { name: 'formation', type: 'relationship', relationTo: 'formations', required: true, index: true },
    {
      type: 'row',
      fields: [
        { name: 'dateDebut', type: 'date', label: 'Date de début', required: true, index: true, admin: { date: { displayFormat: 'd MMMM yyyy' } } },
        { name: 'dateFin', type: 'date', label: 'Date de fin', admin: { date: { displayFormat: 'd MMMM yyyy' }, description: 'Laisser vide pour une formation d’une journée.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'lieu', type: 'text', label: 'Lieu', admin: { description: 'Ex. : salle de la mairie, Vélingara' } },
        { name: 'places', type: 'number', label: 'Nombre de places', min: 1, admin: { description: 'Laisser vide si le nombre n’est pas limité.' } },
      ],
    },
    {
      name: 'dateLimiteInscription',
      type: 'date',
      label: 'Date limite d’inscription',
      admin: { date: { displayFormat: 'd MMMM yyyy' }, description: 'Facultatif. Par défaut, les inscriptions restent possibles jusqu’à la veille du début.' },
    },
    {
      name: 'inscriptionsOuvertes',
      type: 'checkbox',
      label: 'Inscriptions ouvertes',
      defaultValue: true,
      admin: { description: 'Décocher pour fermer les inscriptions en ligne de cette session.' },
    },
    {
      name: 'inscrits',
      type: 'join',
      collection: 'inscriptions',
      on: 'session',
      label: 'Inscriptions reçues',
      admin: { defaultColumns: ['nom', 'telephone', 'commune', 'statut'] },
    },
  ],
}
