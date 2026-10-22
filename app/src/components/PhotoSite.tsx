import Image from 'next/image'

import { PHOTOS_PAR_DEFAUT, type Emplacement } from '@/data/photos'
import type { Langue } from '@/i18n'
import { getPhotos } from '@/lib/payload'

import { Picture } from './Picture'

/**
 * Photo d'un emplacement du site : celle déposée par l'ADET dans /admin (« Photos du site »),
 * sinon la photo d'illustration par défaut, avec son crédit obligatoire.
 */
export async function PhotoSite({
  emplacement,
  lang,
  sizes,
  className,
  priority,
}: {
  emplacement: Emplacement
  lang: Langue
  sizes: string
  className?: string
  priority?: boolean
}) {
  const photos = await getPhotos()
  const media = photos[emplacement]
  if (media && typeof media === 'object' && media.url) {
    return (
      <figure className={`photo-site ${className ?? ''}`}>
        <Picture media={media} taille="large" sizes={sizes} priority={priority} />
        {media.credit && <figcaption className="photo-site__credit">© {media.credit}</figcaption>}
      </figure>
    )
  }
  const p = PHOTOS_PAR_DEFAUT[emplacement]
  return (
    <figure className={`photo-site ${className ?? ''}`}>
      <Image src={p.src} alt={p.alt[lang]} width={p.width} height={p.height} sizes={sizes} priority={priority} />
      <figcaption className="photo-site__credit">
        <a href={p.source} rel="noopener noreferrer" target="_blank">
          {p.auteur} · {p.licence}
        </a>
      </figcaption>
    </figure>
  )
}
