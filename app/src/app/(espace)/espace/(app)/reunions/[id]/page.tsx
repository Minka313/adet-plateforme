import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { estBureau } from '@/access'
import { CarteMembre } from '@/components/espace/Elements'
import { heureDakar } from '@/lib/rappels'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'
import type { User } from '@/payload-types'

import { FormulaireCompteRendu } from '../Formulaires'

export const metadata: Metadata = { title: 'Réunion' }

export default async function FicheReunion({ params }: { params: Promise<{ id: string }> }) {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'reunions', where: { id: { equals: Number((await params).id) } }, limit: 1, depth: 1, user, overrideAccess: false })
  const r = docs[0]
  if (!r) notFound()
  const organisateur = r.organisateur && typeof r.organisateur === 'object' ? r.organisateur : null
  const peutModifier = estBureau(user) || organisateur?.id === user.id
  const participants = r.touteLEquipe ? [] : (r.participants ?? []).filter((p): p is User => typeof p === 'object' && p !== null)

  return (
    <div className="pile">
      <p>
        <Link href="/espace/reunions">← Toutes les réunions</Link>
      </p>
      <section className="salut">
        <p className="salut__date">{heureDakar(r.debut)}</p>
        <h1>{r.titre}</h1>
        <p className="salut__role">
          {[r.lieu, r.duree ? `${r.duree} min` : null, organisateur ? `organisée par ${organisateur.nom ?? organisateur.email}` : null].filter(Boolean).join(' · ')}
        </p>
      </section>
      <div className="deux-colonnes">
        <section className="bloc">
          <h2>Ordre du jour</h2>
          {r.ordreDuJour ? <p className="annonce__texte">{r.ordreDuJour}</p> : <p className="vide-espace">Pas d’ordre du jour.</p>}
        </section>
        <section className="bloc">
          <h2>Participants</h2>
          {r.touteLEquipe ? (
            <p className="vide-espace">Toute l’équipe est conviée.</p>
          ) : (
            <ul className="membres membres--une-colonne">
              {participants.map((m) => (
                <CarteMembre key={m.id} m={m} />
              ))}
            </ul>
          )}
        </section>
      </div>
      {peutModifier ? (
        <FormulaireCompteRendu id={r.id} texte={r.compteRendu ?? ''} />
      ) : (
        <section className="bloc">
          <h2>Compte rendu</h2>
          {r.compteRendu ? <p className="annonce__texte">{r.compteRendu}</p> : <p className="vide-espace">Le compte rendu sera publié ici après la réunion.</p>}
        </section>
      )}
    </div>
  )
}
