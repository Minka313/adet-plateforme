'use client'

import Link from 'next/link'
import { useState } from 'react'

export type CommuneClassee = { id: number; nom: string; href: string; habitants: number; dep: string; depNom: string; couleur: string; valeur: string }

/**
 * Les communes de la plus peuplée à la moins peuplée, filtrables par département.
 * L'échelle des barres reste celle de toute la région : filtrer ne change pas la longueur d'une barre.
 */
export function ClassementCommunes({
  communes,
  departements,
  toutes,
  libelle,
}: {
  communes: CommuneClassee[]
  departements: { slug: string; nom: string; couleur: string }[]
  toutes: string
  libelle: string
}) {
  const [filtre, setFiltre] = useState<string | null>(null)
  const max = Math.max(...communes.map((c) => c.habitants))
  const visibles = filtre ? communes.filter((c) => c.dep === filtre) : communes

  return (
    <div className="classement">
      <div className="classement__filtres" role="group" aria-label={libelle}>
        <button type="button" aria-pressed={filtre === null} onClick={() => setFiltre(null)}>
          {toutes}
        </button>
        {departements.map((d) => (
          <button key={d.slug} type="button" aria-pressed={filtre === d.slug} onClick={() => setFiltre(d.slug)}>
            <span className="puce-couleur" style={{ background: d.couleur }} aria-hidden="true" />
            {d.nom}
          </button>
        ))}
      </div>
      <ol className="classement__liste">
        {visibles.map((c) => (
          <li key={c.id} className="barres__ligne">
            <Link href={c.href} className="barres__nom">
              {c.nom}
              <span className="classement__dep">{c.depNom}</span>
            </Link>
            <span className="barres__piste" aria-hidden="true">
              <span className="barres__barre" style={{ width: `${(c.habitants / max) * 100}%`, background: c.couleur }} />
            </span>
            <span className="barres__valeur">
              <strong>{c.valeur}</strong>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
