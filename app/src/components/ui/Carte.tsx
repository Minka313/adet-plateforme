import { VUE_CASAMANCE, VUE_SENEGAL } from '@/data/carte'

import { CHEMIN_ETOILE } from './Etoiles'

const { largeur: L, hauteur: H, departements, villes } = VUE_CASAMANCE

const capitales = villes.filter((v) => v.capitale)

/** Centre approximatif d'une région = moyenne des centres de ses départements */
const centreRegion = (region: string) => {
  const ds = departements.filter((d) => d.region === region)
  return [ds.reduce((s, d) => s + d.centre[0], 0) / ds.length, ds.reduce((s, d) => s + d.centre[1], 0) / ds.length] as const
}

/** Carte « constellation » pour le hero : contours dorés, chefs-lieux en étoiles reliées. */
export function CarteConstellation({ className }: { className?: string }) {
  return (
    <svg className={`carte-constellation ${className ?? ''}`} viewBox={`-20 -40 ${L + 40} ${H + 80}`} aria-hidden="true" focusable="false">
      <g className="carte-constellation__contours">
        {departements.map((d) => (
          <path key={d.nom} d={d.d} pathLength={1} className={d.kolda ? 'est-kolda' : undefined} />
        ))}
      </g>
      <polyline
        className="carte-constellation__lien"
        points={villes.map((v) => `${v.x},${v.y}`).join(' ')}
        pathLength={1}
      />
      {villes.map((v, i) => (
        <g key={v.nom} transform={`translate(${v.x} ${v.y})`} className="carte-constellation__ville" style={{ ['--d' as string]: `${0.6 + i * 0.25}s` }}>
          <circle r={v.nom === 'Kolda' ? 26 : 16} className="halo" />
          <path d={CHEMIN_ETOILE} transform={`scale(${v.nom === 'Kolda' ? 20 : v.capitale ? 13 : 9})`} />
          <text y={v.nom === 'Kolda' ? -34 : -24} textAnchor="middle">
            {v.nom}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** Carte du territoire : départements de Casamance, Kolda mis en avant. */
export function CarteTerritoire({ titre }: { titre: string }) {
  const regions = ['Ziguinchor', 'Sédhiou', 'Kolda'] as const
  return (
    <figure className="carte-territoire">
      <svg viewBox={`-10 -10 ${L + 20} ${H + 20}`} role="img" aria-label={titre}>
        {departements.map((d) => (
          <path key={d.nom} d={d.d} pathLength={1} className={`dept ${d.kolda ? 'dept--kolda' : `dept--${d.region === 'Sédhiou' ? 'sedhiou' : 'ziguinchor'}`}`}>
            <title>{`${d.nom} (${d.region})`}</title>
          </path>
        ))}
        {departements
          .filter((d) => d.kolda)
          .map((d) => (
            <text key={d.nom} x={d.centre[0]} y={d.centre[1] + (d.nom === 'Kolda' ? 40 : 0)} className="dept__nom" textAnchor="middle">
              {d.nom}
            </text>
          ))}
        {regions
          .filter((r) => r !== 'Kolda')
          .map((r) => {
            const [x, y] = centreRegion(r)
            return (
              <text key={r} x={x} y={y} className="region__nom" textAnchor="middle">
                {r.toUpperCase()}
              </text>
            )
          })}
        {capitales.map((v) => (
          <g key={v.nom} transform={`translate(${v.x} ${v.y})`} className="ville">
            <circle r="9" />
            <circle r="18" className="ville__onde" />
          </g>
        ))}
      </svg>
    </figure>
  )
}

/** Petite carte de situation : le Sénégal, Casamance en évidence. */
export function CarteSenegal({ titre }: { titre: string }) {
  return (
    <svg className="carte-senegal" viewBox={`-4 -4 ${VUE_SENEGAL.largeur + 8} ${VUE_SENEGAL.hauteur + 8}`} role="img" aria-label={titre}>
      {VUE_SENEGAL.regions.map((r) => (
        <path key={r.nom} d={r.d} className={r.casamance ? 'est-casamance' : undefined}>
          <title>{r.nom}</title>
        </path>
      ))}
    </svg>
  )
}
