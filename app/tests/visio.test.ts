import { createVerify, generateKeyPairSync } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'

const charger = async () => {
  vi.resetModules()
  return import('@/lib/visio')
}

afterEach(() => vi.unstubAllEnvs())

describe('Visio', () => {
  it('sans clés JaaS : service public, salle au nom imprévisible et stable', async () => {
    const { configVisio, jetonJaas, nomSalle } = await charger()
    expect(configVisio()).toMatchObject({ fournisseur: 'public', domaine: 'meet.jit.si' })
    expect(nomSalle('equipe')).toMatch(/^adet-equipe-[0-9a-f]{16}$/)
    expect(nomSalle('equipe')).toBe(nomSalle('equipe'))
    expect(nomSalle('reunion-1')).not.toBe(nomSalle('reunion-2'))
    expect(jetonJaas({ salle: 'x', id: 1, nom: 'A', email: 'a@b.sn', moderateur: true })).toBeNull()
  })

  it('avec les clés JaaS : jeton RS256 vérifiable, pour la bonne salle et le bon rôle', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    vi.stubEnv('JAAS_APP_ID', 'vpaas-magic-cookie-test')
    vi.stubEnv('JAAS_API_KEY_ID', 'vpaas-magic-cookie-test/abc123')
    vi.stubEnv('JAAS_PRIVATE_KEY', privateKey.export({ type: 'pkcs8', format: 'pem' }).toString().replace(/\n/g, '\\n'))
    const { configVisio, jetonJaas, nomSalle } = await charger()

    expect(configVisio()).toMatchObject({ fournisseur: 'jaas', domaine: '8x8.vc', script: 'https://8x8.vc/vpaas-magic-cookie-test/external_api.js' })
    const salle = nomSalle('reunion-7')
    expect(salle).toMatch(/^vpaas-magic-cookie-test\/adet-reunion-7-/)

    const jeton = jetonJaas({ salle, id: 3, nom: 'Aminata', email: 'a@adet.sn', moderateur: false })!
    const [entete, contenu, signature] = jeton.split('.')
    expect(createVerify('RSA-SHA256').update(`${entete}.${contenu}`).verify(publicKey, Buffer.from(signature, 'base64url'))).toBe(true)
    expect(JSON.parse(Buffer.from(entete, 'base64url').toString())).toMatchObject({ alg: 'RS256', kid: 'vpaas-magic-cookie-test/abc123' })
    const donnees = JSON.parse(Buffer.from(contenu, 'base64url').toString())
    expect(donnees).toMatchObject({ aud: 'jitsi', sub: 'vpaas-magic-cookie-test', room: salle.split('/')[1] })
    expect(donnees.context.user).toMatchObject({ name: 'Aminata', moderator: 'false' })
  })
})
