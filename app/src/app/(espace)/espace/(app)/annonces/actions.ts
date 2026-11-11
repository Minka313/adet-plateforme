'use server'

import { revalidatePath } from 'next/cache'

import { estBureau } from '@/access'
import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

export type EtatAnnonce = { ok: boolean; message: string } | null

export async function publierAnnonce(_: EtatAnnonce, form: FormData): Promise<EtatAnnonce> {
  const user = await utilisateurCourant()
  if (!user || !estBureau(user)) return { ok: false, message: 'Seul le bureau peut publier une annonce.' }

  const titre = String(form.get('titre') ?? '').trim().slice(0, 140)
  const contenu = String(form.get('contenu') ?? '').trim().slice(0, 4000)
  if (!titre || !contenu) return { ok: false, message: 'Donnez un titre et un texte à l’annonce.' }

  try {
    const payload = await getPayloadClient()
    // Les droits sont vérifiés par Payload avec la personne connectée (overrideAccess: false)
    await payload.create({ collection: 'annonces', data: { titre, contenu, epinglee: form.get('epinglee') === 'on' }, user, overrideAccess: false })
    revalidatePath('/espace', 'layout')
    return { ok: true, message: 'Annonce publiée pour toute l’équipe.' }
  } catch (e) {
    console.error(e)
    return { ok: false, message: 'La publication a échoué. Réessayez.' }
  }
}
