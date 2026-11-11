import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { envoyerMessage } from '@/app/(frontend)/[lang]/contact/actions'
import { notifier } from '@/lib/notifier'
import type { User } from '@/payload-types'

import { payloadTest, vider } from './aide'

let payload: Payload
let admin: User, bureau: User, membre: User, parti: User

const compte = (u: User) => ({ ...u, collection: 'users' as const })
const creer = (email: string, roles: User['roles'], actif = true) =>
  payload.create({ collection: 'users', data: { email, password: 'MotDePasse-123', nom: email.split('@')[0], roles, actif }, overrideAccess: true })
const sesNotifs = async (u: User) =>
  (await payload.find({ collection: 'notifications', where: { destinataire: { equals: u.id } }, sort: '-createdAt', limit: 50, overrideAccess: true })).docs

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  admin = await creer('admin@test.sn', ['admin'])
  bureau = await creer('bureau@test.sn', ['bureau'])
  membre = await creer('membre@test.sn', ['membre'])
  parti = await creer('parti@test.sn', ['membre'], false)
})

afterAll(async () => vider(payload))

describe('Notifications de l’équipe', () => {
  it('une annonce du bureau prévient toute l’équipe active, sauf son auteur', async () => {
    await payload.create({ collection: 'annonces', data: { titre: 'Réunion lundi', contenu: '9 h au siège' }, user: compte(bureau), overrideAccess: false })
    expect((await sesNotifs(membre))[0]).toMatchObject({ titre: 'Réunion lundi', type: 'annonce', lien: '/espace/annonces', lue: false })
    expect((await sesNotifs(admin)).map((n) => n.titre)).toContain('Réunion lundi')
    expect(await sesNotifs(bureau)).toHaveLength(0)
    expect(await sesNotifs(parti)).toHaveLength(0)
  })

  it('un message du formulaire de contact prévient ceux qui gèrent le site, pas les membres', async () => {
    const f = new FormData()
    for (const [k, v] of Object.entries({ langue: 'fr', nom: 'Awa', message: 'Bonjour', telephone: '770000000' })) f.set(k, v)
    expect((await envoyerMessage(null, f))?.ok).toBe(true)
    expect((await sesNotifs(admin))[0]).toMatchObject({ titre: 'Nouveau message : Awa', type: 'message' })
    expect((await sesNotifs(membre)).map((n) => n.type)).not.toContain('message')
  })

  it('chacun ne lit que ses propres notifications, et le public aucune', async () => {
    const { docs } = await payload.find({ collection: 'notifications', user: compte(membre), overrideAccess: false })
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.every((n) => (typeof n.destinataire === 'object' ? n.destinataire.id : n.destinataire) === membre.id)).toBe(true)
    await expect(payload.find({ collection: 'notifications', overrideAccess: false })).rejects.toThrow()
  })

  it('personne ne peut créer de notification par l’API ni lire les appareils abonnés', async () => {
    await expect(
      payload.create({ collection: 'notifications', data: { destinataire: admin.id, titre: 'Faux', type: 'systeme' }, user: compte(membre), overrideAccess: false }),
    ).rejects.toThrow()
    await expect(payload.find({ collection: 'abonnements-push', user: compte(membre), overrideAccess: false })).rejects.toThrow()
  })

  it('notifier ignore les doublons et les destinataires vides, et ne lève jamais d’erreur', async () => {
    const avant = (await sesNotifs(membre)).length
    await notifier(payload, { destinataires: [membre.id, membre.id, null, undefined], titre: 'Test', type: 'systeme' })
    expect((await sesNotifs(membre)).length).toBe(avant + 1)
    await expect(notifier(payload, { destinataires: [], titre: 'Rien', type: 'systeme' })).resolves.toBeUndefined()
  })
})
