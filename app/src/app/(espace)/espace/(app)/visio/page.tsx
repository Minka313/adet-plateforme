import type { Metadata } from 'next'
import Link from 'next/link'

import { estOrganisateur } from '@/access'
import { SalleVisio } from '@/components/espace/SalleVisio'
import { exigerUtilisateur } from '@/lib/session'
import { configVisio, jetonJaas, nomSalle } from '@/lib/visio'

export const metadata: Metadata = { title: 'Salle de l’équipe' }

/** Salle de visio permanente de l'équipe : on s'y retrouve à tout moment, sans planifier */
export default async function SalleEquipe() {
  const user = await exigerUtilisateur()
  const config = configVisio()
  const salle = nomSalle('equipe')
  const nom = user.nom || user.email
  return (
    <div className="pile">
      <section className="salut salut--actions">
        <div>
          <h1>Salle de l’équipe</h1>
          <p className="salut__role">Une salle de visio toujours ouverte, réservée à l’équipe. Pour une réunion planifiée, passez par sa fiche.</p>
        </div>
        <Link href="/espace/reunions" className="bouton bouton--clair">
          Réunions
        </Link>
      </section>
      <SalleVisio
        domaine={config.domaine}
        script={config.script}
        salle={salle}
        jeton={jetonJaas({ salle, id: user.id, nom, email: user.email, moderateur: estOrganisateur(user) })}
        nom={nom}
        email={user.email}
        retour="/espace"
      />
      {config.fournisseur === 'public' && (
        <p className="note-espace">Service public Jitsi : la première personne arrivée doit se connecter (Google, GitHub ou Facebook) pour ouvrir la salle.</p>
      )}
    </div>
  )
}
