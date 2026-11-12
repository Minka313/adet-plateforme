'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { estBureau, ROLES } from '@/access'
import { getPayloadClient } from '@/lib/payload'
import { MODELES_PROPOSES } from '@/lib/rapports'
import { utilisateurCourant } from '@/lib/session'
import type { ModeleRapport } from '@/payload-types'

export type Etat = { ok: boolean; message: string } | null

const message = (e: unknown, defaut: string) => {
  const m = (e as { message?: string })?.message
  return m && !/^(Forbidden|You are not allowed)/i.test(m) && m.length < 160 ? m : defaut
}

/** Rédiger ou corriger un rapport : « brouillon » enregistre, « soumettre » envoie au validateur */
export async function enregistrerRapport(_: Etat, form: FormData): Promise<Etat> {
  const user = await utilisateurCourant()
  if (!user) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' }
  const intention = form.get('intention') === 'soumettre' ? 'soumis' : 'brouillon'
  const intitules = form.getAll('intitule').map(String)
  const valeurs = form.getAll('valeur').map((v) => String(v).trim().slice(0, 10000))
  const obligatoires = form.getAll('obligatoire').map(String)
  if (intention === 'soumis') {
    const manquante = intitules.find((t, i) => obligatoires[i] === 'oui' && !valeurs[i])
    if (manquante) return { ok: false, message: `Remplissez la rubrique « ${manquante} » avant de soumettre.` }
  }
  const reponses = intitules.map((intitule, i) => ({ intitule, valeur: valeurs[i] ?? '' }))
  const payload = await getPayloadClient()
  const idRapport = Number(form.get('id')) || null
  let id: number
  try {
    if (idRapport) {
      await payload.update({ collection: 'rapports', id: idRapport, data: { reponses, statut: intention }, user, overrideAccess: false })
      id = idRapport
    } else {
      const r = await payload.create({
        collection: 'rapports',
        data: { modele: Number(form.get('modele')), periode: String(form.get('periode') ?? '').trim().slice(0, 120), reponses, statut: intention },
        user,
        overrideAccess: false,
      })
      id = r.id
    }
  } catch (e) {
    return { ok: false, message: message(e, 'L’enregistrement a échoué. Réessayez.') }
  }
  revalidatePath('/espace', 'layout')
  if (intention === 'soumis') redirect(`/espace/rapports/${id}`)
  if (!idRapport) redirect(`/espace/rapports/${id}`)
  return { ok: true, message: 'Brouillon enregistré.' }
}

/** Le validateur valide, ou renvoie avec ce qu'il faut corriger */
export async function deciderRapport(_: Etat, form: FormData): Promise<Etat> {
  const user = await utilisateurCourant()
  if (!user) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' }
  const statut = form.get('decision') === 'valider' ? 'valide' : 'a-corriger'
  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'rapports',
      id: Number(form.get('id')),
      data: { statut, commentaire: String(form.get('commentaire') ?? '').trim().slice(0, 4000) },
      user,
      overrideAccess: false,
    })
  } catch (e) {
    return { ok: false, message: message(e, 'La décision n’a pas pu être enregistrée.') }
  }
  revalidatePath('/espace', 'layout')
  return { ok: true, message: statut === 'valide' ? 'Rapport validé. L’auteur est prévenu.' : 'Rapport renvoyé pour correction. L’auteur est prévenu.' }
}

/** Crée les deux modèles proposés (une seule fois), pour que le directeur parte de quelque chose */
export async function creerModelesProposes() {
  const user = await utilisateurCourant()
  if (!user || !estBureau(user)) return
  const payload = await getPayloadClient()
  if ((await payload.count({ collection: 'modeles-rapport', overrideAccess: true })).totalDocs === 0) {
    for (const m of MODELES_PROPOSES) await payload.create({ collection: 'modeles-rapport', data: { ...m, rolesAuteurs: [...m.rolesAuteurs], actif: true }, user, overrideAccess: false })
  }
  revalidatePath('/espace', 'layout')
}

const nombres = (form: FormData, cle: string) => form.getAll(cle).map(Number).filter(Boolean)
const ROLES_VALIDES = ROLES.map((r) => r.value) as string[]

/** Le directeur crée ou modifie un modèle */
export async function enregistrerModele(_: Etat, form: FormData): Promise<Etat> {
  const user = await utilisateurCourant()
  if (!user || !estBureau(user)) return { ok: false, message: 'Seul le bureau règle les modèles de rapport.' }
  const titre = String(form.get('titre') ?? '').trim().slice(0, 120)
  const intitules = form.getAll('intitule').map((v) => String(v).trim().slice(0, 120))
  const aides = form.getAll('aide').map((v) => String(v).trim().slice(0, 200))
  const obligatoires = form.getAll('obligatoire').map(String)
  const sections = intitules.map((intitule, i) => ({ intitule, aide: aides[i] ?? '', obligatoire: obligatoires[i] === 'oui' })).filter((s) => s.intitule)
  if (!titre) return { ok: false, message: 'Donnez un titre au modèle.' }
  if (!sections.length) return { ok: false, message: 'Ajoutez au moins une rubrique.' }
  const periodicite = String(form.get('periodicite'))
  const data = {
    titre,
    description: String(form.get('description') ?? '').trim().slice(0, 600),
    periodicite: (['mensuel', 'trimestriel', 'ponctuel'].includes(periodicite) ? periodicite : 'mensuel') as ModeleRapport['periodicite'],
    jourLimite: Math.min(Math.max(Number(form.get('jourLimite')) || 5, 1), 28),
    actif: form.get('actif') === 'on',
    sections,
    rolesAuteurs: form.getAll('rolesAuteurs').map(String).filter((r) => ROLES_VALIDES.includes(r)) as ModeleRapport['rolesAuteurs'],
    polesAuteurs: nombres(form, 'polesAuteurs'),
    personnesAuteurs: nombres(form, 'personnesAuteurs'),
    validateurs: nombres(form, 'validateurs'),
  }
  if (!data.rolesAuteurs?.length && !data.polesAuteurs.length && !data.personnesAuteurs.length) {
    return { ok: false, message: 'Choisissez qui doit rendre ce rapport (un rôle, un pôle ou des personnes).' }
  }
  const payload = await getPayloadClient()
  const idModele = Number(form.get('id')) || null
  try {
    if (idModele) await payload.update({ collection: 'modeles-rapport', id: idModele, data, user, overrideAccess: false })
    else await payload.create({ collection: 'modeles-rapport', data, user, overrideAccess: false })
  } catch (e) {
    return { ok: false, message: message(e, 'L’enregistrement a échoué. Réessayez.') }
  }
  revalidatePath('/espace', 'layout')
  redirect('/espace/rapports/modeles')
}
