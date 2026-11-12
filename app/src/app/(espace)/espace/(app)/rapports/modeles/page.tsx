import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { estBureau, ROLES } from '@/access'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'

import { creerModelesProposes } from '../actions'

export const metadata: Metadata = { title: 'Modèles de rapport' }

const RYTHME = { mensuel: 'Chaque mois', trimestriel: 'Chaque trimestre', ponctuel: 'Après chaque activité' } as const

export default async function Modeles() {
  const user = await exigerUtilisateur()
  if (!estBureau(user)) notFound()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'modeles-rapport', sort: 'titre', limit: 100, depth: 1, user, overrideAccess: false })

  return (
    <div className="pile">
      <p>
        <Link href="/espace/rapports">← Rapports</Link>
      </p>
      <section className="salut salut--actions">
        <div>
          <h1>Modèles de rapport</h1>
          <p className="salut__role">Vous décidez quels rapports l’équipe rend, à quel rythme, qui les rédige et qui les valide.</p>
        </div>
        <Link href="/espace/rapports/modeles/nouveau" className="bouton bouton--plein">
          Nouveau modèle
        </Link>
      </section>

      {docs.length ? (
        <ul className="modeles">
          {docs.map((m) => {
            const qui = [
              ...(m.rolesAuteurs ?? []).map((r) => ROLES.find((x) => x.value === r)?.label ?? r),
              ...(m.polesAuteurs ?? []).map((p) => (typeof p === 'object' ? p.nom : '')),
              ...(m.personnesAuteurs ?? []).map((p) => (typeof p === 'object' ? (p.nom ?? p.email) : '')),
            ].filter(Boolean)
            const valideurs = (m.validateurs ?? []).map((p) => (typeof p === 'object' ? (p.nom ?? p.email) : '')).filter(Boolean)
            return (
              <li key={m.id} className={`bloc modele ${m.actif === false ? 'modele--inactif' : ''}`}>
                <div className="bloc__tete">
                  <h2>{m.titre}</h2>
                  <Link href={`/espace/rapports/modeles/${m.id}`}>Modifier</Link>
                </div>
                {m.description && <p className="vide-espace">{m.description}</p>}
                <dl className="modele__regles">
                  <div>
                    <dt>Rythme</dt>
                    <dd>
                      {RYTHME[m.periodicite]}
                      {m.periodicite !== 'ponctuel' ? `, avant le ${m.jourLimite ?? 5} du mois suivant` : ''}
                      {m.actif === false ? ' · plus demandé' : ''}
                    </dd>
                  </div>
                  <div>
                    <dt>Rédigé par</dt>
                    <dd>{qui.join(', ') || 'Personne'}</dd>
                  </div>
                  <div>
                    <dt>Validé par</dt>
                    <dd>{valideurs.join(', ') || 'Le bureau'}</dd>
                  </div>
                  <div>
                    <dt>Rubriques</dt>
                    <dd>{(m.sections ?? []).map((s) => s.intitule).join(' · ')}</dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
      ) : (
        <section className="bloc bloc--note">
          <h2>Aucun modèle pour l’instant</h2>
          <p>Partez de deux modèles courants, que vous pourrez ensuite modifier : un rapport mensuel par pôle (responsables de pôle) et un compte rendu après chaque activité (toute l’équipe).</p>
          <form action={creerModelesProposes}>
            <button type="submit" className="bouton bouton--plein">
              Créer les deux modèles proposés
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
