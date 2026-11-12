import type { Metadata } from 'next'
import Link from 'next/link'

import { estBureau } from '@/access'
import { PastilleStatut } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { echeance, joursRestants, libellePeriode, periodeARendre } from '@/lib/periodes'
import { estAuteur, estValidateur } from '@/lib/rapports'
import { exigerUtilisateur } from '@/lib/session'

export const metadata: Metadata = { title: 'Rapports' }

const dateLongue = (d: Date) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d)

export default async function Rapports() {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const [modeles, mesRapports, aValider] = await Promise.all([
    payload.find({ collection: 'modeles-rapport', where: { actif: { not_equals: false } }, sort: 'titre', limit: 100, depth: 0, user, overrideAccess: false }),
    payload.find({ collection: 'rapports', where: { auteur: { equals: user.id } }, sort: '-updatedAt', limit: 30, depth: 0, user, overrideAccess: false }),
    payload.find({
      collection: 'rapports',
      where: { and: [{ statut: { equals: 'soumis' } }, { auteur: { not_equals: user.id } }] },
      sort: 'soumisLe',
      limit: 50,
      depth: 1,
      user,
      overrideAccess: false,
    }),
  ])
  const aRendre = modeles.docs.filter((m) => estAuteur(m, user))
  const modelesParId = new Map(modeles.docs.map((m) => [m.id, m]))
  // Ne garder que les rapports que je valide vraiment (le bureau voit tout, mais ne valide que ses modèles)
  const mesValidations = aValider.docs.filter((r) => {
    const m = modelesParId.get(typeof r.modele === 'object' ? r.modele.id : r.modele)
    return m ? estValidateur(m, user) : estBureau(user)
  })

  return (
    <div className="pile">
      <section className="salut salut--actions">
        <div>
          <h1>Rapports</h1>
          <p className="salut__role">Rédigez, soumettez, faites valider. Vous êtes prévenu à chaque étape.</p>
        </div>
        {estBureau(user) && (
          <Link href="/espace/rapports/modeles" className="bouton bouton--clair">
            Régler les modèles
          </Link>
        )}
      </section>

      {!!mesValidations.length && (
        <section className="bloc bloc--alerte">
          <h2>À valider ({mesValidations.length})</h2>
          <ul className="liste-rapports">
            {mesValidations.map((r) => (
              <li key={r.id}>
                <Link href={`/espace/rapports/${r.id}`}>
                  <strong>{r.titre}</strong>
                  <span>{typeof r.auteur === 'object' ? (r.auteur?.nom ?? r.auteur?.email) : ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bloc">
        <h2>À rendre</h2>
        {aRendre.length ? (
          <ul className="liste-rapports">
            {aRendre.map((m) => {
              if (m.periodicite === 'ponctuel') {
                return (
                  <li key={m.id} className="a-rendre">
                    <div>
                      <strong>{m.titre}</strong>
                      <span>{m.description || 'Après chaque activité.'}</span>
                    </div>
                    <Link href={`/espace/rapports/rediger?modele=${m.id}`} className="bouton bouton--plein bouton--petit">
                      Nouveau
                    </Link>
                  </li>
                )
              }
              const periode = periodeARendre(m.periodicite)!
              const limite = echeance(periode, m.jourLimite ?? 5)!
              const reste = joursRestants(limite)
              const existant = mesRapports.docs.find((r) => (typeof r.modele === 'object' ? r.modele.id : r.modele) === m.id && r.periode === periode)
              return (
                <li key={m.id} className="a-rendre">
                  <div>
                    <strong>
                      {m.titre} · {libellePeriode(periode)}
                    </strong>
                    <span className={!existant || ['brouillon', 'a-corriger'].includes(existant.statut) ? (reste < 0 ? 'rapport__retard' : undefined) : undefined}>
                      {existant ? <PastilleStatut statut={existant.statut} /> : null} À rendre le {dateLongue(limite)}
                      {!existant && reste < 0 ? ' : en retard' : ''}
                    </span>
                  </div>
                  <Link
                    href={existant ? `/espace/rapports/${existant.id}` : `/espace/rapports/rediger?modele=${m.id}&periode=${periode}`}
                    className={`bouton bouton--petit ${!existant || existant.statut === 'brouillon' || existant.statut === 'a-corriger' ? 'bouton--plein' : 'bouton--clair'}`}
                  >
                    {!existant ? 'Rédiger' : existant.statut === 'brouillon' ? 'Continuer' : existant.statut === 'a-corriger' ? 'Corriger' : 'Voir'}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="vide-espace">Aucun rapport ne vous est demandé pour le moment.</p>
        )}
      </section>

      <section className="bloc">
        <h2>Mes rapports</h2>
        {mesRapports.docs.length ? (
          <ul className="liste-rapports">
            {mesRapports.docs.map((r) => (
              <li key={r.id}>
                <Link href={`/espace/rapports/${r.id}`}>
                  <strong>{r.titre}</strong>
                  <PastilleStatut statut={r.statut} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vide-espace">Vous n’avez pas encore rédigé de rapport.</p>
        )}
      </section>
    </div>
  )
}
