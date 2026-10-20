import type { SVGProps } from 'react'

const TRACES = {
  // Axes stratégiques
  capacites: (
    <>
      <path d="M2 9.5 12 5l10 4.5L12 14 2 9.5Z" />
      <path d="M6 11.5v4.2c0 1.3 2.7 2.8 6 2.8s6-1.5 6-2.8v-4.2" />
      <path d="M22 9.5V15" />
    </>
  ),
  partenariats: (
    <>
      <circle cx="8.5" cy="12" r="5.5" />
      <circle cx="15.5" cy="12" r="5.5" />
    </>
  ),
  ressources: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4.4 3-7.5 8-8-.2 5-3.4 8-8 8Z" />
      <path d="M12 15.5c0-3.3-2.4-5.6-6.5-6 .2 3.7 2.7 6 6.5 6Z" />
    </>
  ),
  innovation: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.1V16h5.2v-.1c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </>
  ),
  suivi: (
    <>
      <path d="M3 21h18" />
      <path d="M6 17v-4M11 17V9M16 17v-6" />
      <path d="m4 9 5-4 4 3 7-5" />
    </>
  ),
  // Interface
  fleche: <path d="M5 12h14m-6-6 6 6-6 6" />,
  flecheBas: <path d="M12 5v14m-6-6 6 6 6-6" />,
  externe: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  telecharger: <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />,
  lieu: (
    <>
      <path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  calendrier: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  telephone: (
    <path d="M5 4h4l1.5 4.5-2.3 1.4a11 11 0 0 0 5.9 5.9l1.4-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  guillemets: (
    <path d="M9.5 7C6.5 8 5 10.3 5 13.5V17h4.5v-4.5H7.3c.2-1.8 1.2-3 2.9-3.6L9.5 7Zm9 0c-3 1-4.5 3.3-4.5 6.5V17h4.5v-4.5h-2.2c.2-1.8 1.2-3 2.9-3.6L18.5 7Z" />
  ),
} as const

export type NomIcone = keyof typeof TRACES

export function Icone({ nom, taille = 24, ...props }: { nom: NomIcone; taille?: number } & SVGProps<SVGSVGElement>) {
  const plein = nom === 'guillemets'
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      fill={plein ? 'currentColor' : 'none'}
      stroke={plein ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {TRACES[nom]}
    </svg>
  )
}
