import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { inscrireSession } from '@/app/(frontend)/[lang]/se-former/inscription/[session]/actions'
import { etatSession } from '@/lib/formations'
import { getSessionsAVenir } from '@/lib/payload'

import { payloadTest, vider } from './aide'

let payload: Payload

const jour = (decalage: number) => new Date(Date.now() + decalage * 86_400_000).toISOString()
const ctx = { sansRegeneration: true }

const formulaire = (champs: Record<string, string | number>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(champs)) f.set(k, String(v))
  return f
}

const creerFormation = (titre: string, _status: 'published' | 'draft' = 'published') =>
  payload.create({ collection: 'formations', draft: _status === 'draft', data: { titre, resume: 'r', _status }, overrideAccess: true, context: ctx })

const creerSession = (formation: number, data: { dateDebut: string; places?: number; inscriptionsOuvertes?: boolean }) =>
  payload.create({ collection: 'sessions', data: { formation, ...data }, overrideAccess: true, context: ctx })

let ouverte: number, deuxPlaces: number, passee: number, brouillon: number

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  const publiee = await creerFormation('Gestion d’une petite entreprise')
  const cachee = await creerFormation('Formation en préparation', 'draft')
  ouverte = (await creerSession(publiee.id, { dateDebut: jour(20) })).id
  deuxPlaces = (await creerSession(publiee.id, { dateDebut: jour(10), places: 2 })).id
  passee = (await creerSession(publiee.id, { dateDebut: jour(-3) })).id
  brouillon = (await creerSession(cachee.id, { dateDebut: jour(5) })).id
})

afterAll(async () => vider(payload))

describe('État d’une session', () => {
  const base = { dateDebut: jour(10), dateLimiteInscription: null, inscriptionsOuvertes: true, places: null }

  it('reste ouverte jusqu’à la veille du début, puis se ferme', () => {
    expect(etatSession(base, 0)).toBe('ouverte')
    expect(etatSession({ ...base, dateDebut: new Date().toISOString() }, 0)).toBe('fermee')
  })

  it('se ferme après la date limite d’inscription ou sur décision de l’équipe', () => {
    expect(etatSession({ ...base, dateLimiteInscription: jour(-1) }, 0)).toBe('fermee')
    expect(etatSession({ ...base, inscriptionsOuvertes: false }, 0)).toBe('fermee')
  })

  it('est complète quand toutes les places sont prises', () => {
    expect(etatSession({ ...base, places: 2 }, 1)).toBe('ouverte')
    expect(etatSession({ ...base, places: 2 }, 2)).toBe('complete')
  })
})

describe('Sessions affichées sur le site', () => {
  it('ne montre que les sessions à venir des formations publiées, de la plus proche à la plus lointaine', async () => {
    const sessions = await getSessionsAVenir('fr')
    expect(sessions.map((s) => s.id)).toEqual([deuxPlaces, ouverte])
    expect(sessions[0]).toMatchObject({ restantes: 2, etat: 'ouverte' })
  })

  it('reçoit un titre lisible dans le back-office', async () => {
    const s = await payload.findByID({ collection: 'sessions', id: ouverte, overrideAccess: true })
    expect(s.titre).toMatch(/^Gestion d’une petite entreprise – \d{1,2} \S+ \d{4}$/)
  })
})

describe('Inscription en ligne', () => {
  it('exige un nom et un numéro de téléphone valable', async () => {
    expect(await inscrireSession(null, formulaire({ langue: 'fr', session: ouverte, nom: 'Aminata' }))).toMatchObject({ ok: false })
    const r = await inscrireSession(null, formulaire({ langue: 'en', session: ouverte, nom: 'Aminata', telephone: '1234' }))
    expect(r).toEqual({ ok: false, message: 'The phone number looks incorrect.' })
  })

  it('enregistre l’inscription avec le numéro sans espaces', async () => {
    const r = await inscrireSession(null, formulaire({ langue: 'fr', session: ouverte, nom: 'Aminata Diallo', telephone: '77 123 45 67', commune: 'Vélingara', sexe: 'femme', age: 24 }))
    expect(r?.ok).toBe(true)
    const { docs } = await payload.find({ collection: 'inscriptions', where: { session: { equals: ouverte } }, overrideAccess: true })
    expect(docs[0]).toMatchObject({ nom: 'Aminata Diallo', telephone: '771234567', statut: 'recue', sexe: 'femme', age: 24 })
  })

  it('ne crée pas de doublon pour le même numéro', async () => {
    const r = await inscrireSession(null, formulaire({ langue: 'fr', session: ouverte, nom: 'Aminata', telephone: '771234567' }))
    expect(r?.message).toMatch(/déjà inscrit/)
    expect((await payload.count({ collection: 'inscriptions', where: { session: { equals: ouverte } }, overrideAccess: true })).totalDocs).toBe(1)
  })

  it('refuse les sessions passées et celles d’une formation en brouillon', async () => {
    for (const session of [passee, brouillon, 999999]) {
      const r = await inscrireSession(null, formulaire({ langue: 'fr', session, nom: 'Moussa', telephone: '761234567' }))
      expect(r).toMatchObject({ ok: false, message: 'Les inscriptions à cette session sont fermées.' })
    }
  })

  it('ferme la session quand elle est complète, et une annulation libère la place', async () => {
    const inscrire = (telephone: string) => inscrireSession(null, formulaire({ langue: 'fr', session: deuxPlaces, nom: 'Participant', telephone }))
    // Trois inscriptions maximum par visiteur en 10 minutes : on repart d'un compteur vide
    await payload.delete({ collection: 'inscriptions', where: { id: { exists: true } }, overrideAccess: true })
    expect((await inscrire('700000001'))?.ok).toBe(true)
    expect((await inscrire('700000002'))?.ok).toBe(true)
    expect(await inscrire('700000003')).toEqual({ ok: false, message: 'Désolé, cette session est complète.' })

    await payload.update({ collection: 'inscriptions', where: { telephone: { equals: '700000001' } }, data: { statut: 'annulee' }, overrideAccess: true })
    expect((await inscrire('700000003'))?.ok).toBe(true)
  })

  it('refuse de supprimer une session qui a des inscriptions, ou une formation qui a des sessions', async () => {
    await expect(payload.delete({ collection: 'sessions', id: deuxPlaces, overrideAccess: true, context: ctx })).rejects.toThrow(/a reçu des inscriptions/)
    const s = await payload.findByID({ collection: 'sessions', id: deuxPlaces, depth: 0, overrideAccess: true })
    await expect(payload.delete({ collection: 'formations', id: s.formation as number, overrideAccess: true, context: ctx })).rejects.toThrow(/a des sessions/)
  })

  it('le public ne peut ni lire ni créer d’inscriptions directement', async () => {
    await expect(payload.find({ collection: 'inscriptions', overrideAccess: false })).rejects.toThrow()
    await expect(
      payload.create({ collection: 'inscriptions', data: { session: ouverte, statut: 'recue', nom: 'X', telephone: '770000000' }, overrideAccess: false }),
    ).rejects.toThrow()
  })
})
