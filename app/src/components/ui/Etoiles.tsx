/** Étoiles scintillantes reprises du logo ADET (décoratives). */
const ETOILE = 'M0,-1 C0.08,-0.26 0.26,-0.08 1,0 C0.26,0.08 0.08,0.26 0,1 C-0.08,0.26 -0.26,0.08 -1,0 C-0.26,-0.08 -0.08,-0.26 0,-1Z'

type Etoile = { x: number; y: number; r: number; c?: string; d?: number }

const DEFAUT: Etoile[] = [
  { x: 84, y: 12, r: 1.5, d: 0 },
  { x: 91, y: 7, r: 0.8, d: 1.2 },
  { x: 77, y: 20, r: 1, c: '#FFAE5D', d: 0.6 },
  { x: 95, y: 22, r: 0.7, d: 2 },
  { x: 68, y: 8, r: 0.6, d: 1.6 },
  { x: 60, y: 26, r: 0.5, d: 2.4 },
  { x: 6, y: 86, r: 0.8, d: 0.9 },
  { x: 14, y: 94, r: 0.5, d: 1.9 },
]

export function Etoiles({ etoiles = DEFAUT, className }: { etoiles?: Etoile[]; className?: string }) {
  return (
    <svg className={`etoiles ${className ?? ''}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {etoiles.map((e, i) => (
        <path
          key={i}
          d={ETOILE}
          fill={e.c ?? '#F9DB5F'}
          className="etoile"
          style={{ ['--d' as string]: `${e.d ?? 0}s`, transform: `translate(${e.x}px, ${e.y}px) scale(${e.r})` }}
        />
      ))}
    </svg>
  )
}

export const CHEMIN_ETOILE = ETOILE
