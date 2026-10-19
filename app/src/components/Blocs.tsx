import Link from 'next/link'

import type { Actualite, Partenaire, Realisation } from '@/payload-types'
import { axeLabel } from '@/fields/axe'
import { formatDate, periode } from '@/lib/format'

import { Picture } from './Picture'

export function EnTetePage({ surtitre, titre, intro }: { surtitre?: string; titre: string; intro?: string | null }) {
  return (
    <section className="entete-page">
      <div className="conteneur">
        {surtitre && <p className="surtitre">{surtitre}</p>}
        <h1>{titre}</h1>
        {intro && <p className="entete-page__intro">{intro}</p>}
      </div>
    </section>
  )
}

export function Vide({ children }: { children: React.ReactNode }) {
  return <p className="vide">{children}</p>
}

const STATUTS: Record<string, string> = { 'en-cours': 'En cours', termine: 'Terminé', 'a-venir': 'À venir' }

export function CarteRealisation({ r }: { r: Realisation }) {
  return (
    <article className="carte">
      <Link href={`/realisations/${r.slug}`} className="carte__lien">
        <Picture media={r.image} taille="carte" className="carte__image" sizes="(max-width: 700px) 100vw, 33vw" />
        <div className="carte__corps">
          <p className="carte__meta">
            {r.statut && <span className={`pastille pastille--${r.statut}`}>{STATUTS[r.statut]}</span>}
            {r.lieu && <span>{r.lieu}</span>}
          </p>
          <h3>{r.titre}</h3>
          <p>{r.resume}</p>
          <p className="carte__pied">{[axeLabel(r.axe), periode(r.dateDebut, r.dateFin)].filter(Boolean).join(' · ')}</p>
        </div>
      </Link>
    </article>
  )
}

export function CarteActualite({ a }: { a: Actualite }) {
  return (
    <article className="carte">
      <Link href={`/actualites/${a.slug}`} className="carte__lien">
        <Picture media={a.image} taille="carte" className="carte__image" sizes="(max-width: 700px) 100vw, 33vw" />
        <div className="carte__corps">
          <p className="carte__meta">
            <time dateTime={a.date}>{formatDate(a.date)}</time>
          </p>
          <h3>{a.titre}</h3>
          <p>{a.resume}</p>
        </div>
      </Link>
    </article>
  )
}

export function LogoPartenaire({ p }: { p: Partenaire }) {
  const contenu = (
    <>
      {p.logo && typeof p.logo === 'object' ? (
        <Picture media={p.logo} taille="vignette" className="partenaire__logo" sizes="160px" />
      ) : (
        <span className="partenaire__initiales">{p.nom}</span>
      )}
    </>
  )
  return (
    <li className="partenaire" title={p.nom}>
      {p.siteWeb ? (
        <a href={p.siteWeb} rel="noopener noreferrer" target="_blank" aria-label={p.nom}>
          {contenu}
        </a>
      ) : (
        contenu
      )}
    </li>
  )
}
