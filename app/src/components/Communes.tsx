import Link from 'next/link'

import type { Territoire } from '@/payload-types'
import { dico, lien, type Langue } from '@/i18n'
import { COULEUR_DEPARTEMENT, nomCourt, parArrondissement } from '@/lib/communes'
import { formatNombre, formatPart } from '@/lib/format'

const lienCommune = (lang: Langue, dep: Territoire, c: Territoire) => lien(lang, `/decouvrir-kolda/${dep.slug}/${c.slug}`)

/** Communes d'un département, regroupées par arrondissement, avec leur population */
export function ListeCommunes({ dep, communes, lang }: { dep: Territoire; communes: Territoire[]; lang: Langue }) {
  const d = dico(lang).kolda
  return (
    <div className="communes">
      {parArrondissement(communes).map((g) => (
        <section key={g.arrondissement ?? 'chef-lieu'} className={`communes__groupe${g.arrondissement ? '' : ' communes__groupe--chef-lieu'}`} data-reveal>
          <h3>
            {g.arrondissement ? d.arrondissementDe.replace('{a}', g.arrondissement) : d.chefLieu}
            {g.arrondissement && <span className="communes__total">{formatNombre(g.habitants, lang)} {d.habitants}</span>}
          </h3>
          <ul>
            {g.communes.map((c) => (
              <li key={c.id}>
                <Link href={lienCommune(lang, dep, c)}>{c.nom}</Link>
                {c.habitants != null && <span className="communes__habitants">{formatNombre(c.habitants, lang)}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export type LigneDepartement = { dep: Territoire; habitants: number }

/** Barres horizontales : population de chaque département et sa part de la région */
export function BarresDepartements({ lignes, lang }: { lignes: LigneDepartement[]; lang: Langue }) {
  const region = lignes.reduce((s, l) => s + l.habitants, 0)
  const max = Math.max(...lignes.map((l) => l.habitants))
  return (
    <ul className="barres">
      {lignes.map(({ dep, habitants }) => (
        <li key={dep.id} className="barres__ligne">
          <Link href={lien(lang, `/decouvrir-kolda/${dep.slug}`)} className="barres__nom">
            {nomCourt(dep)}
          </Link>
          <span className="barres__piste" aria-hidden="true">
            <span className="barres__barre" style={{ width: `${(habitants / max) * 100}%`, background: COULEUR_DEPARTEMENT[dep.slug ?? ''] }} />
          </span>
          <span className="barres__valeur">
            <strong>{formatNombre(habitants, lang)}</strong> · {formatPart(habitants / region, lang)}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Tableau des arrondissements (et des communes chefs-lieux), du plus peuplé au moins peuplé */
export function TableauArrondissements({
  departements,
  communes,
  lang,
}: {
  departements: Territoire[]
  communes: Territoire[]
  lang: Langue
}) {
  const d = dico(lang).kolda
  const region = communes.reduce((s, c) => s + (c.habitants ?? 0), 0)
  const lignes = departements.flatMap((dep) =>
    parArrondissement(communes.filter((c) => c.departement === dep.id)).map((g) => ({
      cle: `${dep.id}-${g.arrondissement}`,
      nom: g.arrondissement ?? `${g.communes[0]?.nom} (${d.chefLieu.toLowerCase()})`,
      dep,
      nombre: g.communes.length,
      habitants: g.habitants,
    })),
  )
  return (
    <div className="tableau-defilant" data-reveal>
      <table className="tableau">
        <thead>
          <tr>
            <th scope="col">{d.arrondissement}</th>
            <th scope="col">{d.departement}</th>
            <th scope="col" className="nombre">
              {d.colCommunes}
            </th>
            <th scope="col" className="nombre">
              {d.colHabitants}
            </th>
            <th scope="col" className="nombre">
              {d.colPart}
            </th>
          </tr>
        </thead>
        <tbody>
          {lignes
            .sort((a, b) => b.habitants - a.habitants)
            .map((l) => (
              <tr key={l.cle}>
                <th scope="row">{l.nom}</th>
                <td>
                  <span className="puce-couleur" style={{ background: COULEUR_DEPARTEMENT[l.dep.slug ?? ''] }} aria-hidden="true" />
                  {nomCourt(l.dep)}
                </td>
                <td className="nombre">{l.nombre}</td>
                <td className="nombre">{formatNombre(l.habitants, lang)}</td>
                <td className="nombre">{formatPart(l.habitants / region, lang)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
