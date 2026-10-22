import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { payloadTest, vider } from './aide'

let payload: Payload

const sansRegeneration = { sansRegeneration: true }

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
})

afterAll(async () => vider(payload))

describe('Découvrir Kolda', () => {
  it('le public peut lire les territoires et les filières, mais pas les modifier', async () => {
    const t = await payload.create({
      collection: 'territoires',
      data: { nom: 'Département test', type: 'departement', resume: 'r' },
      overrideAccess: true,
      context: sansRegeneration,
    })
    const { docs } = await payload.find({ collection: 'territoires', overrideAccess: false })
    expect(docs.map((d) => d.nom)).toContain('Département test')
    await expect(
      payload.update({ collection: 'territoires', id: t.id, data: { nom: 'Piraté' }, overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.create({ collection: 'filieres', data: { nom: 'x', resume: 'r' }, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('refuse un chiffre sans source ni année (principe « Toujours sourcer »)', async () => {
    await expect(
      payload.create({
        collection: 'filieres',
        data: { nom: 'Filière test', resume: 'r', indicateurs: [{ valeur: '42 %', libelle: 'sans source' }] } as never,
        overrideAccess: true,
        context: sansRegeneration,
      }),
    ).rejects.toThrow()
  })

  it('génère l’adresse de la page à partir du nom', async () => {
    const f = await payload.create({
      collection: 'filieres',
      data: { nom: 'Forêts et cueillette', resume: 'r' },
      overrideAccess: true,
      context: sansRegeneration,
    })
    expect(f.slug).toBe('forets-et-cueillette')
  })
})
