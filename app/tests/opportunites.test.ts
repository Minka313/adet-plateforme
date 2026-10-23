import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { filtreOpportunitesEnCours } from '@/lib/opportunites'

import { payloadTest, vider } from './aide'

let payload: Payload

const jour = (decalage: number) => new Date(Date.now() + decalage * 86_400_000).toISOString()

const creer = (titre: string, dateLimite: string, _status: 'published' | 'draft' = 'published') =>
  payload.create({
    collection: 'opportunites',
    draft: _status === 'draft',
    data: { titre, type: 'financement', resume: 'r', lien: 'https://exemple.sn', dateLimite, _status },
    overrideAccess: true,
    context: { sansRegeneration: true },
  })

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  await creer('Échue hier', jour(-1))
  await creer('Échéance aujourd’hui', new Date().toISOString())
  await creer('Dans dix jours', jour(10))
  await creer('Brouillon', jour(10), 'draft')
})

afterAll(async () => vider(payload))

describe('Opportunités', () => {
  it('n’affiche que les opportunités publiées et non échues, de la plus proche à la plus lointaine', async () => {
    const { docs } = await payload.find({ collection: 'opportunites', where: filtreOpportunitesEnCours(), sort: 'dateLimite', overrideAccess: false })
    expect(docs.map((d) => d.titre)).toEqual(['Échéance aujourd’hui', 'Dans dix jours'])
  })

  it('le public ne voit pas les brouillons et ne peut pas publier', async () => {
    const { docs } = await payload.find({ collection: 'opportunites', overrideAccess: false })
    expect(docs.map((d) => d.titre)).not.toContain('Brouillon')
    await expect(
      payload.create({
        collection: 'opportunites',
        data: { titre: 'Spam', type: 'emploi', resume: 'r', lien: 'https://x.sn', dateLimite: jour(5) },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('refuse une opportunité sans date limite', async () => {
    await expect(
      payload.create({
        collection: 'opportunites',
        data: { titre: 'Sans date', type: 'emploi', resume: 'r', lien: 'https://x.sn' } as never,
        overrideAccess: true,
        context: { sansRegeneration: true },
      }),
    ).rejects.toThrow()
  })
})
