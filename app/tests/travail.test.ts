import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { envoyerRappels } from '@/lib/rappels'
import type { User } from '@/payload-types'

import { payloadTest, vider } from './aide'

let payload: Payload
let bureau: User, aminata: User, moussa: User, fatou: User

const compte = (u: User) => ({ ...u, collection: 'users' as const })
const creer = (email: string, roles: User['roles']) =>
  payload.create({ collection: 'users', data: { email, password: 'MotDePasse-123', nom: email.split('@')[0], roles }, overrideAccess: true })
const notifs = async (u: User) =>
  (await payload.find({ collection: 'notifications', where: { destinataire: { equals: u.id } }, sort: '-createdAt', limit: 50, overrideAccess: true })).docs

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  bureau = await creer('bureau@test.sn', ['bureau'])
  aminata = await creer('aminata@test.sn', ['membre'])
  moussa = await creer('moussa@test.sn', ['membre'])
  fatou = await creer('fatou@test.sn', ['membre'])
})

afterAll(async () => vider(payload))

describe('Tâches', () => {
  it('un membre crée une tâche pour une collègue, qui en est prévenue', async () => {
    const t = await payload.create({ collection: 'taches', data: { titre: 'Liste des participants', statut: 'a-faire', priorite: 'normale', responsables: [moussa.id] }, user: compte(aminata), overrideAccess: false })
    expect(typeof t.creePar === 'object' ? t.creePar?.id : t.creePar).toBe(aminata.id)
    expect((await notifs(moussa))[0]).toMatchObject({ titre: 'Tâche confiée : Liste des participants', type: 'tache' })
  })

  it('le responsable termine la tâche et la créatrice est prévenue ; un autre membre ne peut pas la modifier', async () => {
    const { docs } = await payload.find({ collection: 'taches', where: { titre: { equals: 'Liste des participants' } }, overrideAccess: true })
    const t = docs[0]
    await expect(payload.update({ collection: 'taches', id: t.id, data: { statut: 'fait' }, user: compte(fatou), overrideAccess: false })).rejects.toThrow()
    await payload.update({ collection: 'taches', id: t.id, data: { statut: 'fait' }, user: compte(moussa), overrideAccess: false })
    expect((await notifs(aminata))[0]).toMatchObject({ titre: 'Tâche terminée : Liste des participants' })
  })

  it('toute l’équipe voit les tâches, le public non', async () => {
    expect((await payload.find({ collection: 'taches', user: compte(fatou), overrideAccess: false })).totalDocs).toBeGreaterThan(0)
    await expect(payload.find({ collection: 'taches', overrideAccess: false })).rejects.toThrow()
  })
})

describe('Réunions', () => {
  it('un membre ne planifie pas de réunion ; le bureau oui, et les participants choisis sont prévenus', async () => {
    const data = { titre: 'Point formations', debut: new Date(Date.now() + 5 * 86_400_000).toISOString(), touteLEquipe: false, participants: [fatou.id] }
    await expect(payload.create({ collection: 'reunions', data, user: compte(moussa), overrideAccess: false })).rejects.toThrow()
    await payload.create({ collection: 'reunions', data, user: compte(bureau), overrideAccess: false })
    expect((await notifs(fatou))[0]).toMatchObject({ titre: 'Réunion : Point formations', type: 'reunion' })
    expect((await notifs(moussa)).map((n) => n.titre)).not.toContain('Réunion : Point formations')
  })

  it('envoie les rappels du jour et de la veille une seule fois', async () => {
    const matin = new Date(Date.UTC(2030, 2, 10, 7, 0))
    await payload.create({ collection: 'reunions', data: { titre: 'Réunion du jour', debut: new Date(Date.UTC(2030, 2, 10, 10, 0)).toISOString(), touteLEquipe: true }, user: compte(bureau), overrideAccess: false })
    await payload.create({ collection: 'reunions', data: { titre: 'Réunion du lendemain', debut: new Date(Date.UTC(2030, 2, 11, 15, 0)).toISOString(), touteLEquipe: true }, user: compte(bureau), overrideAccess: false })

    expect(await envoyerRappels(payload, matin)).toEqual({ jour: 1, veille: 1 })
    const titres = (await notifs(aminata)).map((n) => n.titre)
    expect(titres).toContain('Aujourd’hui : Réunion du jour')
    expect(titres).toContain('Demain : Réunion du lendemain')

    expect(await envoyerRappels(payload, matin)).toEqual({ jour: 0, veille: 0 })
  })
})
