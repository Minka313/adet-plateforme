'use server'

import { revalidatePath } from 'next/cache'

import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

export type EtatTache = { ok: boolean; message: string } | null

const STATUTS = ['a-faire', 'en-cours', 'fait'] as const
const PRIORITES = ['basse', 'normale', 'haute'] as const

export async function creerTache(_: EtatTache, form: FormData): Promise<EtatTache> {
  const user = await utilisateurCourant()
  if (!user) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' }
  const titre = String(form.get('titre') ?? '').trim().slice(0, 160)
  if (!titre) return { ok: false, message: 'Donnez un titre à la tâche.' }
  const echeance = String(form.get('echeance') ?? '')
  const priorite = String(form.get('priorite') ?? 'normale')
  const pole = Number(form.get('pole')) || undefined
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'taches',
      data: {
        titre,
        description: String(form.get('description') ?? '').trim().slice(0, 4000),
        // Midi UTC : la date reste la même quel que soit le fuseau d'affichage
        echeance: /^\d{4}-\d{2}-\d{2}$/.test(echeance) ? `${echeance}T12:00:00.000Z` : undefined,
        priorite: (PRIORITES as readonly string[]).includes(priorite) ? (priorite as (typeof PRIORITES)[number]) : 'normale',
        responsables: form.getAll('responsables').map(Number).filter(Boolean),
        pole,
        statut: 'a-faire',
      },
      user,
      overrideAccess: false,
    })
    revalidatePath('/espace', 'layout')
    return { ok: true, message: 'Tâche créée.' }
  } catch (e) {
    console.error(e)
    return { ok: false, message: 'La création a échoué. Réessayez.' }
  }
}

/** Fait passer une tâche à un autre statut (à faire, en cours, fait) */
export async function changerStatut(form: FormData) {
  const user = await utilisateurCourant()
  if (!user) return
  const statut = String(form.get('statut'))
  if (!(STATUTS as readonly string[]).includes(statut)) return
  const payload = await getPayloadClient()
  try {
    await payload.update({ collection: 'taches', id: Number(form.get('id')), data: { statut: statut as (typeof STATUTS)[number] }, user, overrideAccess: false })
  } catch {
    // Pas le droit de modifier cette tâche : rien ne change
  }
  revalidatePath('/espace', 'layout')
}
