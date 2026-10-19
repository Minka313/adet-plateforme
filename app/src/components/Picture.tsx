import Image from 'next/image'

import type { Media } from '@/payload-types'

type Props = {
  media?: number | Media | null
  taille?: 'vignette' | 'carte' | 'large'
  sizes?: string
  className?: string
  priority?: boolean
}

/** Image Payload optimisée (WebP, variantes pré-calculées), avec repli neutre si absente. */
export function Picture({ media, taille = 'carte', sizes = '(max-width: 700px) 100vw, 50vw', className, priority }: Props) {
  if (!media || typeof media === 'number' || !media.url) {
    return <div className={`picture-vide ${className ?? ''}`} aria-hidden="true" />
  }
  const variante = media.sizes?.[taille]
  const src = variante?.url || media.url
  const width = variante?.width || media.width || 800
  const height = variante?.height || media.height || 600
  return (
    <Image
      src={src}
      alt={media.alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}
