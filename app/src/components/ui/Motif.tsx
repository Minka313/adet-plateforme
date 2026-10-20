import { useId } from 'react'

/**
 * Motif géométrique inspiré du pagne tissé manjak (Casamance) :
 * losanges emboîtés, points et carrés de trame. Se place en fond absolu d'un parent positionné.
 */
export function Motif({
  couleur = 'currentColor',
  opacite = 0.08,
  taille = 56,
  className,
}: {
  couleur?: string
  opacite?: number
  taille?: number
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const t = taille
  const m = t / 2
  return (
    <svg className={`motif ${className ?? ''}`} aria-hidden="true" focusable="false" style={{ opacity: opacite }}>
      <defs>
        <pattern id={`manjak-${id}`} width={t} height={t} patternUnits="userSpaceOnUse">
          <path d={`M${m} ${t * 0.08}L${t * 0.92} ${m}L${m} ${t * 0.92}L${t * 0.08} ${m}Z`} fill="none" stroke={couleur} strokeWidth="1.4" />
          <path d={`M${m} ${t * 0.3}L${t * 0.7} ${m}L${m} ${t * 0.7}L${t * 0.3} ${m}Z`} fill={couleur} />
          <rect x="0" y="0" width={t * 0.1} height={t * 0.1} fill={couleur} />
          <rect x={t * 0.9} y={t * 0.9} width={t * 0.1} height={t * 0.1} fill={couleur} />
          <rect x={t * 0.9} y="0" width={t * 0.1} height={t * 0.1} fill={couleur} />
          <rect x="0" y={t * 0.9} width={t * 0.1} height={t * 0.1} fill={couleur} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#manjak-${id})`} />
    </svg>
  )
}

/** Liseré tissé (bande de séparation) aux couleurs de l'ADET */
export function Lisere({ className }: { className?: string }) {
  return <div className={`lisere ${className ?? ''}`} aria-hidden="true" />
}
