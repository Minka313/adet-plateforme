import Link from 'next/link'

import type { Filiere, Territoire } from '@/payload-types'
import { dico, lien, type Langue } from '@/i18n'

import { Icone } from './ui/Icone'
import { Visuel } from './ui/Visuel'

type Indicateur = NonNullable<Territoire['indicateurs']>[number]
type Repere = NonNullable<Territoire['reperes']>[number]

/** Texte saisi dans /admin : un paragraphe par bloc séparé d'une ligne vide */
export function Paragraphes({ texte }: { texte?: string | null }) {
  if (!texte) return null
  return (
    <div className="prose">
      {texte
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  )
}

/** Chiffres clés, chacun avec sa source et son année (principe « Toujours sourcer ») */
export function Indicateurs({ indicateurs, lang }: { indicateurs?: Indicateur[] | null; lang: Langue }) {
  if (!indicateurs?.length) return null
  const d = dico(lang).kolda
  return (
    <ul className="indicateurs">
      {indicateurs.map((i, n) => (
        <li key={i.id ?? n} className="indicateur" data-reveal style={{ ['--i' as string]: n % 4 }}>
          <p className="indicateur__valeur">{i.valeur}</p>
          <p className="indicateur__libelle">{i.libelle}</p>
          <p className="indicateur__source">
            {d.source} :{' '}
            {i.lien ? (
              <a href={i.lien} rel="noopener noreferrer" target="_blank">
                {i.source}
              </a>
            ) : (
              i.source
            )}
            , {i.annee}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function Reperes({ reperes, lang }: { reperes?: Repere[] | null; lang: Langue }) {
  if (!reperes?.length) return null
  return (
    <aside className="reperes" aria-label={dico(lang).kolda.reperes}>
      <p className="raison__etiquette">{dico(lang).kolda.reperes}</p>
      <dl>
        {reperes.map((r, n) => (
          <div key={r.id ?? n}>
            <dt>{r.titre}</dt>
            <dd>{r.texte}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}

/** Carte d'un département : nom, résumé et population */
export function CarteDepartement({ t, lang, i = 0 }: { t: Territoire; lang: Langue; i?: number }) {
  const d = dico(lang).kolda
  const population = t.indicateurs?.find((x) => /habitants|inhabitants/.test(x.libelle))
  return (
    <article className="carte-dept" data-reveal style={{ ['--i' as string]: i }}>
      <Link href={lien(lang, `/decouvrir-kolda/${t.slug}`)} className="carte-dept__lien">
        <h3>{t.nom}</h3>
        {population && (
          <p className="carte-dept__pop">
            <strong>{population.valeur}</strong> {d.habitants}
          </p>
        )}
        <p>{t.resume}</p>
        <span className="lien-fleche">
          {d.enSavoirPlus} <Icone nom="fleche" taille={18} />
        </span>
      </Link>
    </article>
  )
}

/** Carte d'une filière : photo (ou illustration), nom, résumé */
export function CarteFiliere({ f, lang, i = 0 }: { f: Filiere; lang: Langue; i?: number }) {
  return (
    <article className="carte" data-reveal style={{ ['--i' as string]: i % 3 }}>
      <Link href={lien(lang, `/decouvrir-kolda/${f.slug}`)} className="carte__lien">
        <div className="carte__media">
          <Visuel media={f.photo} axe={f.icone} className="carte__image" sizes="(max-width: 700px) 100vw, 33vw" />
          {f.photo && typeof f.photo === 'object' && f.photo.credit && <span className="photo-site__credit">{f.photo.credit}</span>}
        </div>
        <div className="carte__corps">
          <h3>{f.nom}</h3>
          <p className="carte__resume">{f.resume}</p>
        </div>
      </Link>
    </article>
  )
}
