'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { estOrganisateur } from '@/access'
import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

export type EtatReunion = { ok: boolean; message: string } | null

export async function planifierReunion(_: EtatReunion, form: FormData): Promise<EtatReunion> {
  const user = await utilisateurCourant()
  if (!user || !estOrganisateur(user)) return { ok: false, message: 'Seuls le bureau et les responsables de pôle planifient les réunions.' }
  const titre = String(form.get('titre') ?? '').trim().slice(0, 160)
  const jour = String(form.get('jour') ?? '')
  const heure = String(form.get('heure') ?? '')
  if (!titre || !/^\d{4}-\d{2}-\d{2}$/.test(jour) || !/^\d{2}:\d{2}$/.test(heure)) return { ok: false, message: 'Indiquez un titre, une date et une heure.' }
  const touteLEquipe = form.get('touteLEquipe') === 'on'
  const participants = form.getAll('participants').map(Number).filter(Boolean)
  if (!touteLEquipe && !participants.length) return { ok: false, message: 'Choisissez au moins un participant, ou conviez toute l’équipe.' }

  let id: number
  try {
    const payload = await getPayloadClient()
    const r = await payload.create({
      collection: 'reunions',
      data: {
        titre,
        // Dakar est à UTC+0 toute l'année : l'heure saisie est l'heure UTC
        debut: `${jour}T${heure}:00.000Z`,
        duree: Math.min(Math.max(Number(form.get('duree')) || 60, 15), 600),
        lieu: String(form.get('lieu') ?? '').trim().slice(0, 160),
        ordreDuJour: String(form.get('ordreDuJour') ?? '').trim().slice(0, 4000),
        touteLEquipe,
        visio: form.get('visio') === 'on',
        participants: touteLEquipe ? [] : participants,
      },
      user,
      overrideAccess: false,
    })
    id = r.id
  } catch (e) {
    console.error(e)
    return { ok: false, message: 'La planification a échoué. Réessayez.' }
  }
  revalidatePath('/espace', 'layout')
  redirect(`/espace/reunions/${id}`)
}

export async function enregistrerCompteRendu(_: EtatReunion, form: FormData): Promise<EtatReunion> {
  const user = await utilisateurCourant()
  if (!user) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' }
  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'reunions',
      id: Number(form.get('id')),
      data: { compteRendu: String(form.get('compteRendu') ?? '').trim().slice(0, 20000) },
      user,
      overrideAccess: false,
    })
    revalidatePath('/espace', 'layout')
    return { ok: true, message: 'Compte rendu enregistré.' }
  } catch {
    return { ok: false, message: 'Seuls l’organisateur et le bureau peuvent modifier le compte rendu.' }
  }
}
