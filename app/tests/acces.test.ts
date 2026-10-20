import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { payloadTest, vider } from './aide'

let payload: Payload

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  await payload.create({ collection: 'users', data: { email: 'admin@test.sn', password: 'MotDePasse-123', roles: ['admin'] }, overrideAccess: true })
  await payload.create({
    collection: 'realisations',
    data: { titre: 'Publiée', resume: 'r', _status: 'published' },
    overrideAccess: true,
    context: { sansRegeneration: true },
  })
  await payload.create({
    collection: 'realisations',
    draft: true,
    data: { titre: 'Brouillon secret', resume: 'r', _status: 'draft' },
    overrideAccess: true,
    context: { sansRegeneration: true },
  })
})

afterAll(async () => vider(payload))

describe('Droits d’accès du public (non connecté)', () => {
  it('ne voit que les réalisations publiées', async () => {
    const { docs } = await payload.find({ collection: 'realisations', overrideAccess: false })
    expect(docs.map((d) => d.titre)).toEqual(['Publiée'])
  })

  it('ne peut pas lire les messages reçus', async () => {
    await expect(payload.find({ collection: 'messages', overrideAccess: false })).rejects.toThrow()
  })

  it('ne peut pas créer de message directement par l’API (seul le formulaire du site le peut)', async () => {
    await expect(
      payload.create({ collection: 'messages', data: { nom: 'x', message: 'y' }, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('ne peut pas lire la liste des abonnés', async () => {
    await expect(payload.find({ collection: 'abonnes', overrideAccess: false })).rejects.toThrow()
  })

  it('ne peut pas créer de compte quand un administrateur existe déjà', async () => {
    await expect(
      payload.create({ collection: 'users', data: { email: 'pirate@test.sn', password: 'x-123456' }, overrideAccess: false }),
    ).rejects.toThrow()
  })
})

describe('Rôles du back-office', () => {
  it('un éditeur ne peut pas s’attribuer le rôle administrateur', async () => {
    const editeur = await payload.create({
      collection: 'users',
      data: { email: 'editeur@test.sn', password: 'MotDePasse-123', roles: ['editeur'] },
      overrideAccess: true,
    })
    const modifie = await payload.update({
      collection: 'users',
      id: editeur.id,
      data: { roles: ['admin'] },
      overrideAccess: false,
      user: { ...editeur, collection: 'users' },
    })
    expect(modifie.roles).toEqual(['editeur'])
  })

  it('un éditeur ne peut pas lire les autres comptes', async () => {
    const editeur = (await payload.find({ collection: 'users', where: { email: { equals: 'editeur@test.sn' } }, overrideAccess: true })).docs[0]
    const { docs } = await payload.find({ collection: 'users', overrideAccess: false, user: { ...editeur, collection: 'users' } })
    expect(docs.map((u) => u.email)).toEqual(['editeur@test.sn'])
  })
})
