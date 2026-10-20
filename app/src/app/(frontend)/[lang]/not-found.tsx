import Link from 'next/link'

import { Etoiles } from '@/components/ui/Etoiles'

// Rendue dans la langue par défaut : not-found ne reçoit pas les paramètres de route.
export default function Introuvable() {
  return (
    <section className="entete-page page-404">
      <Etoiles className="entete-page__etoiles" />
      <div className="conteneur">
        <p className="chiffre">404</p>
        <h1 style={{ margin: '0 auto 1rem' }}>Page introuvable · Page not found</h1>
        <p>La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
        <p style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link href="/fr" className="bouton bouton--or">
            Retour à l&apos;accueil
          </Link>
          <Link href="/en" className="bouton bouton--clair">
            Back to home
          </Link>
        </p>
      </div>
    </section>
  )
}
