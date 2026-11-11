import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { utilisateurCourant } from '@/lib/session'

import { FormulaireConnexion } from './Formulaire'

export const metadata: Metadata = { title: 'Connexion' }

export default async function Connexion() {
  if (await utilisateurCourant()) redirect('/espace')
  return (
    <main className="connexion">
      <div className="lisere" aria-hidden="true" />
      <div className="connexion__carte">
        <Image src="/brand/adet-logo.png" alt="ADET" width={1251} height={795} priority sizes="120px" className="connexion__logo" />
        <h1>Espace pro</h1>
        <p className="connexion__intro">L’espace de travail de l’équipe de l’ADET : annonces, annuaire, et bientôt tâches, réunions et rapports.</p>
        <FormulaireConnexion />
        <p className="connexion__aide">
          Pas encore de compte, ou mot de passe oublié ? Demandez à un administrateur de l’ADET : il crée les comptes et peut réinitialiser votre mot de passe.
        </p>
        <Link href="/fr" className="connexion__retour">
          Retour au site de l’ADET
        </Link>
      </div>
    </main>
  )
}
