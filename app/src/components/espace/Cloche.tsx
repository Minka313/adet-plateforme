'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { IconeEspace } from './Icones'

/** Cloche de l'en-tête : la pastille se met à jour chaque minute (quand l'onglet est visible) et à chaque changement de page */
export function Cloche({ initial }: { initial: number }) {
  const [nonLues, setNonLues] = useState(initial)
  const chemin = usePathname()

  useEffect(() => {
    let actif = true
    const relire = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const r = await fetch('/espace/notifications/compte', { cache: 'no-store', credentials: 'include' })
        if (r.ok && actif) setNonLues(((await r.json()) as { nonLues: number }).nonLues)
      } catch {
        // Réseau coupé : on garde le dernier chiffre connu
      }
    }
    relire()
    const minuteur = setInterval(relire, 60_000)
    document.addEventListener('visibilitychange', relire)
    return () => {
      actif = false
      clearInterval(minuteur)
      document.removeEventListener('visibilitychange', relire)
    }
  }, [chemin])

  return (
    <Link href="/espace/notifications" className="bouton-icone cloche" aria-label={nonLues ? `Notifications, ${nonLues} non lues` : 'Notifications'}>
      <IconeEspace nom="cloche" />
      {nonLues > 0 && <span className="cloche__pastille">{nonLues > 99 ? '99+' : nonLues}</span>}
    </Link>
  )
}
