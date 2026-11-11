import Link from 'next/link'

/** Au-dessus du formulaire de connexion du back-office : oriente l'équipe vers la bonne porte */
export default function AvantConnexion() {
  return (
    <p className="adet-avant-connexion">
      Back-office du site, réservé aux administrateurs et aux éditeurs. Membre de l’équipe ? Connectez-vous à l’<Link href="/espace/connexion">espace pro</Link>.
    </p>
  )
}
