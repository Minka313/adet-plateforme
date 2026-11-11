import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hors connexion' }

// Page statique, gardée sur le téléphone par le service worker
export const dynamic = 'force-static'

export default function HorsLigne() {
  return (
    <main className="connexion">
      <div className="lisere" aria-hidden="true" />
      <div className="connexion__carte">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/adet-logo.png" alt="ADET" width={96} height={61} className="connexion__logo" />
        <h1>Pas de connexion</h1>
        <p className="connexion__intro">L’espace pro a besoin d’internet pour afficher les informations à jour de l’équipe. Vérifiez votre réseau ou votre forfait, puis réessayez.</p>
        {/* Rechargement complet volontaire : sans réseau, la navigation de Next ne peut rien charger */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/espace" className="bouton bouton--plein">
          Réessayer
        </a>
      </div>
    </main>
  )
}
