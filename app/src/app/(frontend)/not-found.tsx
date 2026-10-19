import Link from 'next/link'

export default function PageIntrouvable() {
  return (
    <section className="section">
      <div className="conteneur conteneur--texte vide-page">
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="bouton">
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  )
}
