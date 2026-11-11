import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { Users } from '@/collections/Users'
import type { User } from '@/payload-types'

import { payloadTest, vider } from './aide'

let payload: Payload
let membre: User, bureau: User, editeur: User

const compte = (u: User) => ({ ...u, collection: 'users' as const })
const creer = (email: string, roles: User['roles'], extra: Partial<User> = {}) =>
  payload.create({ collection: 'users', data: { email, password: 'MotDePasse-123', nom: email.split('@')[0], roles, ...extra }, overrideAccess: true })

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  await creer('admin@test.sn', ['admin'])
  membre = await creer('membre@test.sn', ['membre'])
  bureau = await creer('bureau@test.sn', ['bureau'])
  editeur = await creer('editeur@test.sn', ['editeur'])
})

afterAll(async () => vider(payload))

describe('Espace pro : droits de l’équipe', () => {
  it('un membre ne peut ni créer ni modifier les contenus du site', async () => {
    await expect(
      payload.create({ collection: 'actualites', data: { titre: 'x', resume: 'r', date: new Date().toISOString() }, user: compte(membre), overrideAccess: false }),
    ).rejects.toThrow()
    await expect(payload.updateGlobal({ slug: 'coordonnees', data: { email: 'pirate@x.sn' }, user: compte(membre), overrideAccess: false })).rejects.toThrow()
  })

  it('un membre ne lit ni les messages reçus ni les inscriptions', async () => {
    await expect(payload.find({ collection: 'messages', user: compte(membre), overrideAccess: false })).rejects.toThrow()
    await expect(payload.find({ collection: 'inscriptions', user: compte(membre), overrideAccess: false })).rejects.toThrow()
  })

  it('seuls l’équipe du site (admin, éditeur) ouvre le back-office', async () => {
    const acces = Users.access!.admin as (a: { req: { user: unknown } }) => boolean
    expect(acces({ req: { user: compte(editeur) } })).toBe(true)
    expect(acces({ req: { user: compte(membre) } })).toBe(false)
    expect(acces({ req: { user: compte(bureau) } })).toBe(false)
  })

  it('le bureau publie une annonce, dont il est l’auteur ; un membre la lit mais ne peut pas en publier', async () => {
    const a = await payload.create({ collection: 'annonces', data: { titre: 'Réunion vendredi', contenu: '10 h au siège' }, user: compte(bureau), overrideAccess: false })
    expect(typeof a.auteur === 'object' ? a.auteur?.id : a.auteur).toBe(bureau.id)
    const { docs } = await payload.find({ collection: 'annonces', user: compte(membre), overrideAccess: false })
    expect(docs.map((d) => d.titre)).toContain('Réunion vendredi')
    await expect(payload.create({ collection: 'annonces', data: { titre: 'x', contenu: 'y' }, user: compte(membre), overrideAccess: false })).rejects.toThrow()
  })

  it('le public ne voit pas les annonces internes', async () => {
    await expect(payload.find({ collection: 'annonces', overrideAccess: false })).rejects.toThrow()
  })

  it('un membre complète son profil mais ne peut pas changer ses rôles', async () => {
    const maj = await payload.update({
      collection: 'users',
      id: membre.id,
      data: { telephone: '77 458 61 05', roles: ['admin'] },
      user: compte(membre),
      overrideAccess: false,
    })
    expect(maj.telephone).toBe('77 458 61 05')
    expect(maj.roles).toEqual(['membre'])
  })

  it('un compte désactivé ne peut plus se connecter', async () => {
    await creer('parti@test.sn', ['membre'], { actif: false })
    await expect(payload.login({ collection: 'users', data: { email: 'parti@test.sn', password: 'MotDePasse-123' } })).rejects.toThrow(/désactivé/)
    const ok = await payload.login({ collection: 'users', data: { email: 'membre@test.sn', password: 'MotDePasse-123' } })
    expect(ok.token).toBeTruthy()
  })
})
