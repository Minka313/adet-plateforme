'use server'

import { revalidatePath } from 'next/cache'

import { getPayloadClient } from '@/lib/payload'
import { utilisateurCourant } from '@/lib/session'

export type EtatProfil = { ok: boolean; message: string } | null

const texte = (form: FormData, cle: string, max: number) => String(form.get(cle) ?? '').trim().slice(0, max)

export async function modifierProfil(_: EtatProfil, form: FormData): Promise<EtatProfil> {
  const user = await utilisateurCourant()
  if (!user) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' }
  const nom = texte(form, 'nom', 120)
  if (!nom) return { ok: false, message: 'Indiquez votre nom complet.' }
  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { nom, fonction: texte(form, 'fonction', 120), telephone: texte(form, 'telephone', 40) },
      user,
      overrideAccess: false,
    })
    revalidatePath('/espace', 'layout')
    return { ok: true, message: 'Profil enregistré.' }
  } catch (e) {
    console.error(e)
    return { ok: false, message: 'L’enregistrement a échoué. Réessayez.' }
  }
}

export async function changerMotDePasse(_: EtatProfil, form: FormData): Promise<EtatProfil> {
  const user = await utilisateurCourant()
  if (!user) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' }
  const actuel = String(form.get('actuel') ?? '')
  const nouveau = String(form.get('nouveau') ?? '')
  if (nouveau.length < 10) return { ok: false, message: 'Le nouveau mot de passe doit faire au moins 10 caractères.' }
  if (nouveau !== String(form.get('confirmation') ?? '')) return { ok: false, message: 'Les deux nouveaux mots de passe ne sont pas identiques.' }

  const payload = await getPayloadClient()
  try {
    // Le mot de passe actuel est vérifié : une session restée ouverte ne suffit pas à le changer
    await payload.login({ collection: 'users', data: { email: user.email, password: actuel } })
  } catch {
    return { ok: false, message: 'Le mot de passe actuel est incorrect.' }
  }
  try {
    await payload.update({ collection: 'users', id: user.id, data: { password: nouveau }, user, overrideAccess: false })
    return { ok: true, message: 'Mot de passe changé. Utilisez-le à la prochaine connexion.' }
  } catch (e) {
    console.error(e)
    return { ok: false, message: 'Le changement a échoué. Réessayez.' }
  }
}
