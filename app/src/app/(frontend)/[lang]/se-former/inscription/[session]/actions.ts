'use server'

import { dico, estLangue } from '@/i18n'
import { empreinteVisiteur, tropDeRequetes } from '@/lib/antiAbus'
import { filtreInscriptionsActives } from '@/lib/formations'
import { getPayloadClient, getSessionAVenir } from '@/lib/payload'

export type EtatInscription = { ok: boolean; message: string } | null

export async function inscrireSession(_: EtatInscription, form: FormData): Promise<EtatInscription> {
  const langBrute = String(form.get('langue') ?? 'fr')
  const lang = estLangue(langBrute) ? langBrute : 'fr'
  const t = dico(lang).inscription

  // Champ piège invisible : rempli uniquement par les robots
  if (form.get('site')) return { ok: true, message: t.ok }

  const texte = (cle: string, max: number) => String(form.get(cle) ?? '').trim().slice(0, max)
  const nom = texte('nom', 120)
  // Le numéro est gardé sans espaces ni tirets, pour repérer les doublons
  const telephone = texte('telephone', 40).replace(/[^\d+]/g, '')
  const email = texte('email', 160)
  const commune = texte('commune', 80)
  const motivation = texte('motivation', 2000)
  const sexeBrut = texte('sexe', 10)
  const sexe = sexeBrut === 'femme' || sexeBrut === 'homme' ? sexeBrut : undefined
  const ageBrut = Number(texte('age', 3))
  const age = Number.isInteger(ageBrut) && ageBrut >= 10 && ageBrut <= 100 ? ageBrut : undefined
  const sessionId = Number(texte('session', 12))

  if (!nom || !telephone) return { ok: false, message: t.erreurChamps }
  if (telephone.replace(/\D/g, '').length < 9) return { ok: false, message: t.erreurTelephone }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: t.erreurEmail }

  try {
    const session = Number.isInteger(sessionId) && sessionId > 0 ? await getSessionAVenir(sessionId, lang) : null
    if (!session || session.etat === 'fermee') return { ok: false, message: t.fermee }

    const payload = await getPayloadClient()
    const doublon = await payload.count({
      collection: 'inscriptions',
      where: { and: [filtreInscriptionsActives(session.id), { telephone: { equals: telephone } }] },
      overrideAccess: true,
    })
    if (doublon.totalDocs) return { ok: true, message: t.dejaInscrit }
    if (session.etat === 'complete') return { ok: false, message: t.complet }

    const empreinte = await empreinteVisiteur()
    if (await tropDeRequetes(payload, 'inscriptions', empreinte)) return { ok: false, message: t.erreurRafale }
    await payload.create({
      collection: 'inscriptions',
      overrideAccess: true,
      data: { session: session.id, statut: 'recue', nom, telephone, email: email || undefined, commune, sexe, age, motivation, langue: lang, empreinte },
    })
    return { ok: true, message: t.ok }
  } catch (e) {
    console.error(e)
    return { ok: false, message: t.erreur }
  }
}
