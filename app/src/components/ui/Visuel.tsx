import type { Media } from '@/payload-types'
import { AXE_PAR_INDEX, type Axe } from '@/fields/axe'

import { Picture } from '../Picture'
import { Icone } from './Icone'
import { Motif } from './Motif'

/**
 * Visuel de carte : la photo si elle existe, sinon une illustration aux couleurs de l'axe
 * (dégradé + motif manjak + icône), pour que le site reste beau sans photos.
 */
export function Visuel({
  media,
  axe,
  taille = 'carte',
  sizes,
  className,
  priority,
}: {
  media?: number | Media | null
  axe?: string | null
  taille?: 'vignette' | 'carte' | 'large'
  sizes?: string
  className?: string
  priority?: boolean
}) {
  if (media && typeof media === 'object' && media.url) {
    return <Picture media={media} taille={taille} sizes={sizes} className={className} priority={priority} />
  }
  const a: Axe = (AXE_PAR_INDEX as string[]).includes(axe ?? '') ? (axe as Axe) : 'capacites'
  return (
    <div className={`visuel visuel--${a} ${className ?? ''}`} aria-hidden="true">
      <Motif couleur="#fff" opacite={0.12} taille={44} />
      <Icone nom={a} taille={56} className="visuel__icone" />
    </div>
  )
}
