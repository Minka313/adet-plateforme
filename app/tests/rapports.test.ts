import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { echeance, libellePeriode, periodesEcoulees } from '@/lib/periodes'
import { relancerRapports } from '@/lib/rapports'
import type { ModeleRapport, User } from '@/payload-types'

import { payloadTest, vider } from './aide'

let payload: Payload
let directeur: User, responsable: User, membre: User, verificatrice: User, modele: ModeleRapport

const compte = (u: User) => ({ ...u, collection: 'users' as const })
const creer = (email: string, roles: User['roles']) =>
  payload.create({ collection: 'users', data: { email, password: 'MotDePasse-123', nom: email.split('@')[0], roles }, overrideAccess: true })
const derniereNotif = async (u: User) =>
  (await payload.find({ collection: 'notifications', where: { destinataire: { equals: u.id } }, sort: '-createdAt', limit: 1, overrideAccess: true })).docs[0]

beforeAll(async () => {
  payload = await payloadTest()
  await vider(payload)
  // Le premier compte créé devient administrateur : on le crée à part pour que le directeur reste « bureau »
  await creer('admin@test.sn', ['admin'])
  directeur = await creer('directeur@test.sn', ['bureau'])
  responsable = await creer('responsable@test.sn', ['responsable'])
  membre = await creer('membre@test.sn', ['membre'])
  verificatrice = await creer('verif@test.sn', ['membre'])
  modele = await payload.create({
    collection: 'modeles-rapport',
    data: {
      titre: 'Rapport mensuel',
      periodicite: 'mensuel',
      jourLimite: 5,
      actif: true,
      rolesAuteurs: ['responsable'],
      sections: [
        { intitule: 'Activités', obligatoire: true },
        { intitule: 'Difficultés', obligatoire: false },
      ],
    },
    user: compte(directeur),
    overrideAccess: false,
  })
})

afterAll(async () => vider(payload))

describe('Périodes', () => {
  it('propose les périodes écoulées, y compris au changement d’année', () => {
    expect(periodesEcoulees('mensuel', new Date(Date.UTC(2026, 10, 12)))).toEqual(['2026-10', '2026-09', '2026-08'])
    expect(periodesEcoulees('mensuel', new Date(Date.UTC(2027, 0, 5)), 1)).toEqual(['2026-12'])
    expect(periodesEcoulees('trimestriel', new Date(Date.UTC(2027, 1, 5)), 2)).toEqual(['2026-T4', '2026-T3'])
  })

  it('nomme les périodes et calcule leur date limite', () => {
    expect(libellePeriode('2026-10')).toBe('octobre 2026')
    expect(libellePeriode('2026-T1')).toBe('1er trimestre 2026')
    expect(echeance('2026-10', 5)?.toISOString().slice(0, 10)).toBe('2026-11-05')
    expect(echeance('2026-T4', 10)?.toISOString().slice(0, 10)).toBe('2027-01-10')
  })
})

describe('Circuit d’un rapport', () => {
  let idRapport: number

  it('seul le bureau règle les modèles', async () => {
    await expect(payload.update({ collection: 'modeles-rapport', id: modele.id, data: { titre: 'x' }, user: compte(membre), overrideAccess: false })).rejects.toThrow()
  })

  it('un membre à qui le rapport n’est pas demandé ne peut pas en créer', async () => {
    await expect(
      payload.create({ collection: 'rapports', data: { modele: modele.id, periode: '2026-10', statut: 'brouillon' }, user: compte(membre), overrideAccess: false }),
    ).rejects.toThrow(/pas demandé/)
  })

  it('le responsable soumet son rapport : le bureau est prévenu, les autres membres ne le voient pas', async () => {
    const r = await payload.create({
      collection: 'rapports',
      data: { modele: modele.id, periode: '2026-10', statut: 'soumis', reponses: [{ intitule: 'Activités', valeur: 'Deux formations' }] },
      user: compte(responsable),
      overrideAccess: false,
    })
    idRapport = r.id
    expect(r).toMatchObject({ titre: 'Rapport mensuel · octobre 2026', statut: 'soumis' })
    expect(await derniereNotif(directeur)).toMatchObject({ titre: 'Rapport à valider : Rapport mensuel · octobre 2026' })
    expect((await payload.find({ collection: 'rapports', user: compte(membre), overrideAccess: false })).totalDocs).toBe(0)
  })

  it('refuse un second rapport pour la même période', async () => {
    await expect(
      payload.create({ collection: 'rapports', data: { modele: modele.id, periode: '2026-10', statut: 'brouillon' }, user: compte(responsable), overrideAccess: false }),
    ).rejects.toThrow(/déjà un rapport/)
  })

  it('une correction exige un commentaire ; l’auteur est prévenu, corrige et soumet à nouveau', async () => {
    await expect(payload.update({ collection: 'rapports', id: idRapport, data: { statut: 'a-corriger' }, user: compte(directeur), overrideAccess: false })).rejects.toThrow(
      /Expliquez/,
    )
    await payload.update({ collection: 'rapports', id: idRapport, data: { statut: 'a-corriger', commentaire: 'Ajoutez les chiffres' }, user: compte(directeur), overrideAccess: false })
    expect(await derniereNotif(responsable)).toMatchObject({ titre: 'Rapport à corriger : Rapport mensuel · octobre 2026', texte: 'Ajoutez les chiffres' })
    const corrige = await payload.update({
      collection: 'rapports',
      id: idRapport,
      data: { statut: 'soumis', reponses: [{ intitule: 'Activités', valeur: 'Deux formations, 48 participants' }] },
      user: compte(responsable),
      overrideAccess: false,
    })
    expect(corrige.statut).toBe('soumis')
  })

  it('le bureau valide sans pouvoir réécrire le rapport ; ensuite plus personne ne le modifie', async () => {
    const valide = await payload.update({
      collection: 'rapports',
      id: idRapport,
      data: { statut: 'valide', reponses: [{ intitule: 'Activités', valeur: 'Réécrit' }] },
      user: compte(directeur),
      overrideAccess: false,
    })
    expect(valide.statut).toBe('valide')
    expect(valide.reponses?.[0]?.valeur).toBe('Deux formations, 48 participants')
    expect(await derniereNotif(responsable)).toMatchObject({ titre: 'Rapport validé : Rapport mensuel · octobre 2026' })
    await expect(payload.update({ collection: 'rapports', id: idRapport, data: { statut: 'brouillon' }, user: compte(responsable), overrideAccess: false })).rejects.toThrow(
      /déjà validé/,
    )
  })

  it('quand le directeur choisit les validateurs, eux seuls valident', async () => {
    const m = await payload.create({
      collection: 'modeles-rapport',
      data: { titre: 'Bilan', periodicite: 'ponctuel', actif: true, rolesAuteurs: ['responsable'], validateurs: [verificatrice.id], sections: [{ intitule: 'Bilan', obligatoire: true }] },
      user: compte(directeur),
      overrideAccess: false,
    })
    const r = await payload.create({ collection: 'rapports', data: { modele: m.id, periode: 'Atelier de Kolda', statut: 'soumis' }, user: compte(responsable), overrideAccess: false })
    expect(await derniereNotif(verificatrice)).toMatchObject({ titre: 'Rapport à valider : Bilan · Atelier de Kolda' })
    await expect(payload.update({ collection: 'rapports', id: r.id, data: { statut: 'valide' }, user: compte(directeur), overrideAccess: false })).rejects.toThrow()
    expect((await payload.update({ collection: 'rapports', id: r.id, data: { statut: 'valide' }, user: compte(verificatrice), overrideAccess: false })).statut).toBe('valide')
  })
})

describe('Relances', () => {
  it('relance 3 jours avant la date limite ceux qui n’ont pas rendu, une seule fois', async () => {
    const autre = await creer('autre-responsable@test.sn', ['responsable'])
    // Le 2 décembre : le rapport de novembre est dû le 5
    const le2decembre = new Date(Date.UTC(2026, 11, 2, 7))
    expect(await relancerRapports(payload, le2decembre)).toBeGreaterThanOrEqual(2)
    expect(await derniereNotif(autre)).toMatchObject({ titre: 'À rendre dans 3 jours : Rapport mensuel', texte: 'Période : novembre 2026' })
    expect(await relancerRapports(payload, le2decembre)).toBe(0)
  })
})
