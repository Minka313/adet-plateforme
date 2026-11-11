import type { Metadata } from 'next'
import Link from 'next/link'

import { IconeEspace, type NomIconeEspace } from '@/components/espace/Icones'
import type { Notification } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { exigerUtilisateur } from '@/lib/session'

import { toutMarquerLu } from './actions'

export const metadata: Metadata = { title: 'Notifications' }

const ICONE_PAR_TYPE: Record<Notification['type'], NomIconeEspace> = {
  annonce: 'annonces',
  inscription: 'profil',
  message: 'cloche',
  tache: 'reglages',
  reunion: 'equipe',
  systeme: 'cloche',
}

/** « il y a 5 min », « il y a 3 h », puis la date */
const quand = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  if (minutes < 24 * 60) return `il y a ${Math.round(minutes / 60)} h`
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' }).format(new Date(iso))
}

export default async function Notifications() {
  const user = await exigerUtilisateur()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'notifications', where: { destinataire: { equals: user.id } }, sort: '-createdAt', limit: 60, depth: 0, overrideAccess: true })
  const nonLues = docs.filter((n) => !n.lue).length

  return (
    <div className="pile">
      <section className="salut salut--actions">
        <div>
          <h1>Notifications</h1>
          <p className="salut__role">{nonLues ? `${nonLues} non ${nonLues > 1 ? 'lues' : 'lue'}` : 'Tout est lu.'}</p>
        </div>
        {nonLues > 0 && (
          <form action={toutMarquerLu}>
            <button type="submit" className="bouton bouton--clair">
              Tout marquer comme lu
            </button>
          </form>
        )}
      </section>
      {docs.length ? (
        <ul className="notifs">
          {docs.map((n) => (
            <li key={n.id} className={n.lue ? undefined : 'notif--nouvelle'}>
              <Link href={`/espace/notifications/ouvrir/${n.id}`} prefetch={false} className="notif">
                <span className="notif__icone" aria-hidden="true">
                  <IconeEspace nom={ICONE_PAR_TYPE[n.type]} />
                </span>
                <span className="notif__texte">
                  <strong>{n.titre}</strong>
                  {n.texte && <span>{n.texte}</span>}
                </span>
                <time dateTime={n.createdAt}>{quand(n.createdAt)}</time>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="vide-espace">Aucune notification pour le moment. Vous serez prévenu ici des annonces du bureau et de ce qui vous concerne.</p>
      )}
    </div>
  )
}
