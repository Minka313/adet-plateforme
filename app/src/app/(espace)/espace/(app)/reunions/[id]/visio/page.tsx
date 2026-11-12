import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { estBureau } from '@/access'
import { SalleVisio } from '@/components/espace/SalleVisio'
import { getPayloadClient } from '@/lib/payload'
import { heureDakar } from '@/lib/rappels'
import { exigerUtilisateur } from '@/lib/session'
import { configVisio, jetonJaas, nomSalle } from '@/lib/visio'

export const metadata: Metadata = { title: 'Visio' }

const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null | undefined))

/** Salle de visio d'une réunion : réservée aux personnes conviées ; l'organisateur et le bureau la modèrent */
export default async function VisioReunion({ params }: { params: Promise<{ id: string }> }) {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'reunions', where: { id: { equals: Number((await params).id) } }, limit: 1, depth: 0, user, overrideAccess: false })
  const r = docs[0]
  if (!r || !r.visio) notFound()
  const organisateur = id(r.organisateur) === user.id
  const convie = r.touteLEquipe || organisateur || estBureau(user) || (r.participants ?? []).some((p) => id(p) === user.id)
  if (!convie) notFound()

  const config = configVisio()
  const salle = nomSalle(`reunion-${r.id}`)
  const nom = user.nom || user.email
  return (
    <div className="pile">
      <p>
        <Link href={`/espace/reunions/${r.id}`}>← {r.titre}</Link>
      </p>
      <section className="salut">
        <p className="salut__date">{heureDakar(r.debut)}</p>
        <h1>{r.titre}</h1>
      </section>
      <SalleVisio
        domaine={config.domaine}
        script={config.script}
        salle={salle}
        jeton={jetonJaas({ salle, id: user.id, nom, email: user.email, moderateur: organisateur || estBureau(user) })}
        nom={nom}
        email={user.email}
        retour={`/espace/reunions/${r.id}`}
      />
      {config.fournisseur === 'public' && (
        <p className="note-espace">Service public Jitsi : la première personne arrivée doit se connecter (Google, GitHub ou Facebook) pour ouvrir la salle.</p>
      )}
    </div>
  )
}
