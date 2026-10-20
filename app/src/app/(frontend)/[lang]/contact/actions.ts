'use server'

import { dico, estLangue } from '@/i18n'
import { empreinteVisiteur, tropDeRequetes } from '@/lib/antiAbus'
import { getPayloadClient } from '@/lib/payload'

export type EtatFormulaire = { ok: boolean; message: string } | null

const OBJETS = ['information', 'partenariat', 'adhesion', 'formation', 'autre'] as const
type Objet = (typeof OBJETS)[number]

export async function envoyerMessage(_: EtatFormulaire, form: FormData): Promise<EtatFormulaire> {
  const langBrute = String(form.get('langue') ?? 'fr')
  const lang = estLangue(langBrute) ? langBrute : 'fr'
  const t = dico(lang).contact

  // Champ piège invisible : rempli uniquement par les robots
  if (form.get('site')) return { ok: true, message: t.ok }

  const texte = (cle: string, max: number) => String(form.get(cle) ?? '').trim().slice(0, max)
  const nom = texte('nom', 120)
  const email = texte('email', 160)
  const telephone = texte('telephone', 40)
  const organisation = texte('organisation', 160)
  const message = texte('message', 5000)
  const objetBrut = texte('objet', 20)
  const objet: Objet = (OBJETS as readonly string[]).includes(objetBrut) ? (objetBrut as Objet) : 'autre'

  if (!nom || !message) return { ok: false, message: t.erreurChamps }
  if (!email && !telephone) return { ok: false, message: t.erreurContact }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: t.erreurEmail }

  try {
    const payload = await getPayloadClient()
    const empreinte = await empreinteVisiteur()
    if (await tropDeRequetes(payload, 'messages', empreinte)) return { ok: false, message: t.erreurRafale }
    await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: { nom, email: email || undefined, telephone, organisation, objet, message, langue: lang, empreinte },
    })
    return { ok: true, message: t.ok }
  } catch (e) {
    console.error(e)
    return { ok: false, message: t.erreur }
  }
}
