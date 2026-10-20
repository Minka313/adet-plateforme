import Link from 'next/link'

import type { Actualite, Partenaire, Realisation } from '@/payload-types'
import { axeLabel } from '@/fields/axe'
import { dico, lien, type Langue } from '@/i18n'
import { formatDate, periode } from '@/lib/format'

import { Picture } from './Picture'
import { Etoiles } from './ui/Etoiles'
import { Icone } from './ui/Icone'
import { Motif } from './ui/Motif'
import { Visuel } from './ui/Visuel'

/** En-tête sombre des pages intérieures */
export function EnTetePage({
  surtitre,
  titre,
  intro,
  children,
}: {
  surtitre?: React.ReactNode
  titre: string
  intro?: string | null
  children?: React.ReactNode
}) {
  return (
    <section className="entete-page">
      <Motif couleur="#fff" opacite={0.05} taille={60} />
      <Etoiles className="entete-page__etoiles" />
      <div className="conteneur entete-page__contenu">
        {surtitre && <p className="surtitre surtitre--or">{surtitre}</p>}
        <h1>{titre}</h1>
        {intro && <p className="entete-page__intro">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

export function TitreSection({
  surtitre,
  titre,
  intro,
  lienHref,
  lienLabel,
  clair,
}: {
  surtitre?: string
  titre: string
  intro?: string
  lienHref?: string
  lienLabel?: string
  clair?: boolean
}) {
  return (
    <div className={`titre-section ${clair ? 'titre-section--clair' : ''}`} data-reveal>
      <div>
        {surtitre && <p className="surtitre">{surtitre}</p>}
        <h2>{titre}</h2>
        {intro && <p className="titre-section__intro">{intro}</p>}
      </div>
      {lienHref && lienLabel && (
        <Link href={lienHref} className="lien-fleche">
          {lienLabel} <Icone nom="fleche" taille={18} />
        </Link>
      )}
    </div>
  )
}

export function Vide({ children }: { children: React.ReactNode }) {
  return (
    <div className="vide" data-reveal>
      <Etoiles className="vide__etoiles" />
      <p>{children}</p>
    </div>
  )
}

export function CarteRealisation({ r, lang, i = 0 }: { r: Realisation; lang: Langue; i?: number }) {
  const d = dico(lang)
  return (
    <article className="carte" data-reveal style={{ ['--i' as string]: i }}>
      <Link href={lien(lang, `/realisations/${r.slug}`)} className="carte__lien">
        <div className="carte__media">
          <Visuel media={r.image} axe={r.axe} className="carte__image" sizes="(max-width: 700px) 100vw, 33vw" />
          {r.statut && <span className={`pastille pastille--${r.statut}`}>{d.realisations.statut[r.statut]}</span>}
        </div>
        <div className="carte__corps">
          {r.axe && <p className="carte__axe">{axeLabel(r.axe, lang)}</p>}
          <h3>{r.titre}</h3>
          <p className="carte__resume">{r.resume}</p>
          <p className="carte__meta">
            {r.lieu && (
              <span>
                <Icone nom="lieu" taille={16} /> {r.lieu}
              </span>
            )}
            {(r.dateDebut || r.dateFin) && (
              <span>
                <Icone nom="calendrier" taille={16} /> {periode(r.dateDebut, r.dateFin, lang)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </article>
  )
}

export function CarteActualite({ a, lang, i = 0, une }: { a: Actualite; lang: Langue; i?: number; une?: boolean }) {
  const d = dico(lang)
  return (
    <article className={`carte ${une ? 'carte--une' : ''}`} data-reveal style={{ ['--i' as string]: i }}>
      <Link href={lien(lang, `/actualites/${a.slug}`)} className="carte__lien">
        <div className="carte__media">
          <Visuel media={a.image} axe="partenariats" className="carte__image" sizes={une ? '(max-width: 900px) 100vw, 60vw' : '(max-width: 700px) 100vw, 33vw'} />
        </div>
        <div className="carte__corps">
          <p className="carte__axe">
            <time dateTime={a.date}>{formatDate(a.date, lang)}</time>
          </p>
          <h3>{a.titre}</h3>
          <p className="carte__resume">{a.resume}</p>
          <span className="lien-fleche">
            {d.actualites.lire} <Icone nom="fleche" taille={18} />
          </span>
        </div>
      </Link>
    </article>
  )
}

export function LogoPartenaire({ p }: { p: Partenaire }) {
  const contenu =
    p.logo && typeof p.logo === 'object' ? (
      <Picture media={p.logo} taille="vignette" className="partenaire__logo" sizes="160px" />
    ) : (
      <span className="partenaire__nom">{p.nom}</span>
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

export function AppelAction({ titre, texte, href, label }: { titre: string; texte: string; href: string; label: string }) {
  return (
    <section className="appel">
      <Motif couleur="#F9DB5F" opacite={0.09} taille={72} />
      <Etoiles className="appel__etoiles" />
      <div className="conteneur appel__contenu" data-reveal>
        <div>
          <h2>{titre}</h2>
          <p>{texte}</p>
        </div>
        <Link href={href} className="bouton bouton--or bouton--grand">
          {label} <Icone nom="fleche" taille={20} />
        </Link>
      </div>
    </section>
  )
}
