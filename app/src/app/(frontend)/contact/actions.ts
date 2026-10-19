'use server'

import { getPayloadClient } from '@/lib/payload'

export type EtatFormulaire = { ok: boolean; message: string } | null

const OBJETS = ['information', 'partenariat', 'adhesion', 'formation', 'autre'] as const
type Objet = (typeof OBJETS)[number]

export async function envoyerMessage(_: EtatFormulaire, form: FormData): Promise<EtatFormulaire> {
  // Champ piège invisible : rempli uniquement par les robots
  if (form.get('site')) return { ok: true, message: 'Merci, votre message a bien été envoyé.' }

  const texte = (cle: string, max: number) => String(form.get(cle) ?? '').trim().slice(0, max)
  const nom = texte('nom', 120)
  const email = texte('email', 160)
  const telephone = texte('telephone', 40)
  const message = texte('message', 5000)
  const objetBrut = texte('objet', 20)
  const objet: Objet = (OBJETS as readonly string[]).includes(objetBrut) ? (objetBrut as Objet) : 'autre'

  if (!nom || !message) return { ok: false, message: 'Merci d’indiquer votre nom et votre message.' }
  if (!email && !telephone) return { ok: false, message: 'Indiquez un e-mail ou un téléphone pour qu’on puisse vous répondre.' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'L’adresse e-mail semble incorrecte.' }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: { nom, email: email || undefined, telephone, objet, message },
    })
    return { ok: true, message: 'Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.' }
  } catch (e) {
    console.error(e)
    return { ok: false, message: 'Une erreur est survenue. Réessayez ou contactez-nous par téléphone.' }
  }
}
