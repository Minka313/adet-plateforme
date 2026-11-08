import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { chargerCommunes, COMMUNES } from '@/contenus/communes'
import { parArrondissement } from '@/lib/communes'
import { getCommunes, getTerritoires } from '@/lib/payload'

import { payloadTest, vider } from './aide'

let payload: Payload

const ctx = { sansRegeneration: true }

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  for (const [ordre, [slug, nom]] of [
    ['kolda', 'Département de Kolda'],
    ['velingara', 'Département de Vélingara'],
    ['medina-yoro-foulah', 'Département de Médina Yoro Foulah'],
  ].entries())
    await payload.create({ collection: 'territoires', data: { nom, slug, type: 'departement', ordre, resume: 'r' }, overrideAccess: true, context: ctx })
})

afterAll(async () => vider(payload))

describe('Données des communes (RGPH-5)', () => {
  const somme = (dep: keyof typeof COMMUNES) => COMMUNES[dep].communes.reduce((s, [, , h]) => s + h, 0)

  it('retrouve exactement les totaux du recensement par département', () => {
    expect(somme('kolda')).toBe(324_192)
    expect(somme('velingara')).toBe(405_149)
    expect(somme('medina-yoro-foulah')).toBe(185_456)
  })

  it('compte 40 communes et 9 arrondissements', () => {
    const toutes = Object.values(COMMUNES).flatMap((d) => d.communes)
    expect(toutes).toHaveLength(40)
    expect(new Set(toutes.map(([, a]) => a).filter(Boolean)).size).toBe(9)
  })
})

describe('Chargement des communes', () => {
  it('crée les 40 communes rattachées à leur département, sans doublon au second passage', async () => {
    await chargerCommunes(payload)
    await chargerCommunes(payload)
    const communes = await getCommunes('fr')
    expect(communes).toHaveLength(40)
    expect(communes.every((c) => typeof c.departement === 'number')).toBe(true)
  })

  it('donne une adresse distincte à la commune qui porte le nom de son département', async () => {
    const communes = await getCommunes('fr')
    expect(communes.find((c) => c.nom === 'Kolda')?.slug).toBe('commune-de-kolda')
    expect(communes.find((c) => c.nom === 'Diaobé-Kabendou')?.slug).toBe('diaobe-kabendou')
  })

  it('traduit le résumé en anglais', async () => {
    const [c] = (await getCommunes('en')).filter((x) => x.nom === 'Pata')
    expect(c.resume).toBe('A municipality in Niaming district, Médina Yoro Foulah department.')
  })

  it('n’ajoute pas les communes aux territoires de la page principale', async () => {
    const territoires = await getTerritoires('fr')
    expect(territoires.map((t) => t.type)).not.toContain('commune')
  })

  it('range la commune chef-lieu en premier, puis les arrondissements', async () => {
    const kolda = (await getTerritoires('fr')).find((t) => t.slug === 'kolda')!
    const groupes = parArrondissement((await getCommunes('fr')).filter((c) => c.departement === kolda.id))
    expect(groupes.map((g) => g.arrondissement)).toEqual([null, 'Dioulacolon', 'Mampatim', 'Saré Bidji'])
    expect(groupes.reduce((s, g) => s + g.habitants, 0)).toBe(324_192)
  })

  it('refuse une commune sans département', async () => {
    await expect(
      payload.create({ collection: 'territoires', data: { nom: 'Commune orpheline', type: 'commune', resume: 'r' }, overrideAccess: true, context: ctx }),
    ).rejects.toThrow()
  })
})
