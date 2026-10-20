'use server'

import { estLangue } from '@/i18n/config'
import { empreinteVisiteur, tropDeRequetes } from '@/lib/antiAbus'
import { getPayloadClient } from '@/lib/payload'

export type EtatNewsletter = { ok: boolean; message: string } | null

const TEXTES = {
  fr: { ok: 'Merci ! Vous êtes inscrit·e à notre lettre d’information.', invalide: 'Adresse e-mail invalide.', rafale: 'Réessayez dans quelques minutes.', erreur: 'Inscription impossible pour le moment.' },
  en: { ok: 'Thank you! You are now subscribed to our newsletter.', invalide: 'Invalid email address.', rafale: 'Please try again in a few minutes.', erreur: 'Subscription is not possible right now.' },
}

export async function inscrireNewsletter(_: EtatNewsletter, form: FormData): Promise<EtatNewsletter> {
  const brut = String(form.get('langue') ?? 'fr')
  const lang = estLangue(brut) ? brut : 'fr'
  const t = TEXTES[lang]
  if (form.get('site')) return { ok: true, message: t.ok }

  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 160)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: t.invalide }

  try {
    const payload = await getPayloadClient()
    const empreinte = await empreinteVisiteur()
    if (await tropDeRequetes(payload, 'abonnes', empreinte, { max: 5, minutes: 30 })) return { ok: false, message: t.rafale }
    const existant = await payload.find({ collection: 'abonnes', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
    if (existant.docs[0]) {
      // Réinscription : on réactive sans révéler si l'adresse était déjà connue
      await payload.update({ collection: 'abonnes', id: existant.docs[0].id, data: { actif: true }, overrideAccess: true })
    } else {
      await payload.create({
        collection: 'abonnes',
        overrideAccess: true,
        data: { email, langue: lang, actif: true, consentement: new Date().toISOString(), empreinte },
      })
    }
    return { ok: true, message: t.ok }
  } catch (e) {
    console.error(e)
    return { ok: false, message: t.erreur }
  }
}
