import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PastilleStatut } from '@/components/espace/Elements'
import { getPayloadClient } from '@/lib/payload'
import { estValidateur } from '@/lib/rapports'
import { exigerUtilisateur } from '@/lib/session'
import type { ModeleRapport, User } from '@/payload-types'

import { FormulaireDecision, FormulaireRapport } from '../Formulaires'

export const metadata: Metadata = { title: 'Rapport' }

const date = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Dakar' }).format(new Date(iso)) : ''

export default async function FicheRapport({ params }: { params: Promise<{ id: string }> }) {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'rapports', where: { id: { equals: Number((await params).id) } }, limit: 1, depth: 1, user, overrideAccess: false })
  const r = docs[0]
  if (!r) notFound()
  const modele = typeof r.modele === 'object' ? (r.modele as ModeleRapport) : null
  const auteur = typeof r.auteur === 'object' ? (r.auteur as User) : null
  const validePar = typeof r.validePar === 'object' ? (r.validePar as User) : null
  const estSonAuteur = auteur?.id === user.id
  const modifiable = estSonAuteur && (r.statut === 'brouillon' || r.statut === 'a-corriger')
  const peutDecider = !estSonAuteur && r.statut === 'soumis' && modele && estValidateur(modele, user)
  const valeurs = Object.fromEntries((r.reponses ?? []).map((x) => [x.intitule, x.valeur ?? '']))
  // Les rubriques du modèle (actuelles), sinon celles enregistrées dans le rapport
  const sections = modele?.sections?.length ? modele.sections : (r.reponses ?? []).map((x) => ({ intitule: x.intitule, aide: '', obligatoire: false }))

  return (
    <div className="pile">
      <p>
        <Link href="/espace/rapports">← Rapports</Link>
      </p>
      <section className="salut">
        <PastilleStatut statut={r.statut} />
        <h1>{r.titre}</h1>
        <p className="salut__role">
          {[
            auteur ? `Par ${auteur.nom ?? auteur.email}` : null,
            r.soumisLe ? `soumis le ${date(r.soumisLe)}` : null,
            r.statut === 'valide' && validePar ? `validé par ${validePar.nom ?? validePar.email} le ${date(r.valideLe)}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </section>

      {r.commentaire && (r.statut === 'a-corriger' || r.statut === 'valide') && (
        <section className={`bloc ${r.statut === 'a-corriger' ? 'bloc--alerte' : ''}`}>
          <h2>{r.statut === 'a-corriger' ? 'À corriger' : 'Commentaire du validateur'}</h2>
          <p className="annonce__texte">{r.commentaire}</p>
        </section>
      )}

      {modifiable && modele ? (
        <FormulaireRapport id={r.id} modele={modele.id} sections={sections} valeurs={valeurs} />
      ) : (
        <section className="bloc rapport">
          {(r.reponses ?? []).map((x) => (
            <div key={x.id ?? x.intitule} className="rapport__rubrique">
              <h2>{x.intitule}</h2>
              {x.valeur ? <p className="annonce__texte">{x.valeur}</p> : <p className="vide-espace">Non renseigné.</p>}
            </div>
          ))}
        </section>
      )}

      {peutDecider && <FormulaireDecision id={r.id} />}
    </div>
  )
}
