import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import type { User } from '@/payload-types'

import { getPayloadClient } from './payload'

/** La personne connectée (cookie de session Payload), ou null */
export const utilisateurCourant = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user && user.collection === 'users' && user.actif !== false ? (user as User) : null
})

/** Pour les pages de l'espace pro : renvoie vers la connexion si personne n'est connecté */
export const exigerUtilisateur = async (): Promise<User> => {
  const user = await utilisateurCourant()
  if (!user) redirect('/espace/connexion')
  return user
}

/** Prénom pour saluer (« Aminata » pour « Aminata Diallo »), sinon le début de l'e-mail */
export const prenom = (user: Pick<User, 'nom' | 'email'>) => user.nom?.split(' ')[0] || user.email.split('@')[0]

/** Initiales pour l'avatar (« AD ») */
export const initiales = (user: Pick<User, 'nom' | 'email'>) =>
  (user.nom || user.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join('')
