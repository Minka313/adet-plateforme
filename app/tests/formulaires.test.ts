import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { envoyerMessage } from '@/app/(frontend)/[lang]/contact/actions'
import { inscrireNewsletter } from '@/app/actions/newsletter'
import { slugify } from '@/fields/slug'

import { payloadTest, vider } from './aide'

let payload: Payload

const formulaire = (champs: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(champs)) f.set(k, v)
  return f
}

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
})

afterAll(async () => vider(payload))

describe('Formulaire de contact', () => {
  it('refuse un message sans nom', async () => {
    const r = await envoyerMessage(null, formulaire({ langue: 'fr', message: 'Bonjour', email: 'a@b.sn' }))
    expect(r?.ok).toBe(false)
  })

  it('refuse un message sans moyen de réponse', async () => {
    const r = await envoyerMessage(null, formulaire({ langue: 'fr', nom: 'Awa', message: 'Bonjour' }))
    expect(r).toMatchObject({ ok: false })
    expect(r?.message).toMatch(/e-mail ou un téléphone/)
  })

  it('refuse un e-mail invalide (message en anglais sur le site anglais)', async () => {
    const r = await envoyerMessage(null, formulaire({ langue: 'en', nom: 'John', message: 'Hi', email: 'pas-un-email' }))
    expect(r).toEqual({ ok: false, message: 'The email address looks incorrect.' })
  })

  it('enregistre un message valide avec sa langue et une empreinte anonyme', async () => {
    const r = await envoyerMessage(null, formulaire({ langue: 'en', nom: 'John', message: 'Partnership?', email: 'john@ong.org', objet: 'partenariat' }))
    expect(r?.ok).toBe(true)
    const { docs } = await payload.find({ collection: 'messages', overrideAccess: true })
    expect(docs[0]).toMatchObject({ nom: 'John', langue: 'en', objet: 'partenariat' })
    expect(docs[0].empreinte).toHaveLength(32)
  })

  it('ignore silencieusement les robots (champ piège rempli)', async () => {
    const avant = await payload.count({ collection: 'messages', overrideAccess: true })
    const r = await envoyerMessage(null, formulaire({ langue: 'fr', nom: 'Bot', message: 'spam', email: 'b@b.sn', site: 'http://spam' }))
    expect(r?.ok).toBe(true)
    expect((await payload.count({ collection: 'messages', overrideAccess: true })).totalDocs).toBe(avant.totalDocs)
  })

  it('bloque les envois en rafale (au-delà de 3 en 10 minutes)', async () => {
    const envoyer = () => envoyerMessage(null, formulaire({ langue: 'fr', nom: 'Awa', message: 'Test', telephone: '770000000' }))
    await envoyer()
    await envoyer()
    const r = await envoyer()
    expect(r?.ok).toBe(false)
    expect(r?.message).toMatch(/plusieurs messages/)
  })
})

describe('Newsletter', () => {
  it('inscrit une adresse en minuscules et ne crée pas de doublon', async () => {
    expect((await inscrireNewsletter(null, formulaire({ langue: 'fr', email: 'Awa@Exemple.SN' })))?.ok).toBe(true)
    expect((await inscrireNewsletter(null, formulaire({ langue: 'fr', email: 'awa@exemple.sn' })))?.ok).toBe(true)
    const { docs } = await payload.find({ collection: 'abonnes', overrideAccess: true })
    expect(docs.map((d) => d.email)).toEqual(['awa@exemple.sn'])
  })

  it('refuse une adresse invalide', async () => {
    expect(await inscrireNewsletter(null, formulaire({ langue: 'en', email: 'nope' }))).toEqual({ ok: false, message: 'Invalid email address.' })
  })
})

describe('Adresses des pages (slugs)', () => {
  it('produit des adresses lisibles sans accents', () => {
    expect(slugify('Formation : entrepreneuriat agricole à Vélingara !')).toBe('formation-entrepreneuriat-agricole-a-velingara')
    expect(slugify("L'ADET à Médina Yoro Foulah")).toBe('l-adet-a-medina-yoro-foulah')
  })
})
