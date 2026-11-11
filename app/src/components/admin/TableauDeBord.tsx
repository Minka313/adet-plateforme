import Link from 'next/link'
import type { ServerProps } from 'payload'

import { filtreSessionsAVenir } from '@/lib/formations'
import { filtreOpportunitesEnCours } from '@/lib/opportunites'

/** Icônes au trait du back-office (couleur du texte) */
const ICONES = {
  message: 'M4 5h16v11H8l-4 4zM8 9h8M8 12h5',
  inscription: 'M16 21v-1a5 5 0 0 0-10 0v1M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M16 11h6',
  brouillon: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  actualite: 'M5 4h12v16H7a2 2 0 0 1-2-2zM17 8h2v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4',
  realisation: 'M5 21V4h10l-1.5 3.5L15 11H5',
  session: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  opportunite: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z',
  annonce: 'M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1zM16 8.5a5 5 0 0 1 0 7',
  compte: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21a8 8 0 0 1 16 0',
  site: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9',
  export: 'M12 4v11M7 10l5 5 5-5M5 20h14',
} as const

function Icone({ nom, taille = 20 }: { nom: keyof typeof ICONES; taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONES[nom]} />
    </svg>
  )
}

const date = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Africa/Dakar' })
const COLLECTIONS_SUIVIES = [
  ['actualites', 'Actualité'],
  ['realisations', 'Réalisation'],
  ['formations', 'Formation'],
  ['opportunites', 'Opportunité'],
] as const

/**
 * Accueil du back-office : ce qui demande une action, le site en chiffres,
 * les derniers messages et inscriptions, les raccourcis et les dernières modifications.
 */
export default async function TableauDeBord({ payload, user }: ServerProps) {
  const brouillon = { _status: { equals: 'draft' } } as const
  const publie = { _status: { equals: 'published' } } as const
  const [messages, derniersMessages, inscriptions, dernieresInscriptions, brouillons, enLigne, sessions, opportunites, abonnes, partenaires, ...recents] =
    await Promise.all([
      payload.count({ collection: 'messages', where: { traite: { not_equals: true } } }),
      payload.find({ collection: 'messages', where: { traite: { not_equals: true } }, limit: 4, depth: 0, sort: '-createdAt' }),
      payload.count({ collection: 'inscriptions', where: { statut: { equals: 'recue' } } }),
      payload.find({ collection: 'inscriptions', where: { statut: { equals: 'recue' } }, limit: 4, depth: 1, sort: '-createdAt' }),
      Promise.all(COLLECTIONS_SUIVIES.map(([c]) => payload.count({ collection: c, where: brouillon }))),
      Promise.all(COLLECTIONS_SUIVIES.map(([c]) => payload.count({ collection: c, where: publie }))),
      payload.count({ collection: 'sessions', where: filtreSessionsAVenir() }),
      payload.count({ collection: 'opportunites', where: filtreOpportunitesEnCours() }),
      payload.count({ collection: 'abonnes', where: { actif: { equals: true } } }),
      payload.count({ collection: 'partenaires' }),
      ...COLLECTIONS_SUIVIES.map(([c]) => payload.find({ collection: c, limit: 3, depth: 0, sort: '-updatedAt', draft: true })),
    ])

  const nbBrouillons = brouillons.reduce((s, r) => s + r.totalDocs, 0)
  const [actualites, realisations, formations] = enLigne.map((r) => r.totalDocs)
  const prenom = (user as { nom?: string | null } | undefined)?.nom?.split(' ')[0]
  const maintenant = new Date()
  const heure = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Dakar' }).format(maintenant))
  const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Dakar' }).format(maintenant)

  const aTraiter = [
    { icone: 'message', valeur: messages.totalDocs, libelle: messages.totalDocs > 1 ? 'messages à traiter' : 'message à traiter', href: '/admin/collections/messages?where[traite][not_equals]=true' },
    { icone: 'inscription', valeur: inscriptions.totalDocs, libelle: inscriptions.totalDocs > 1 ? 'inscriptions à confirmer' : 'inscription à confirmer', href: '/admin/collections/inscriptions?where[statut][equals]=recue' },
    { icone: 'brouillon', valeur: nbBrouillons, libelle: nbBrouillons > 1 ? 'brouillons en attente' : 'brouillon en attente', href: '/admin/collections/actualites?where[_status][equals]=draft' },
  ] as const

  const chiffres = [
    { valeur: actualites, libelle: 'actualités en ligne', href: '/admin/collections/actualites' },
    { valeur: realisations, libelle: 'réalisations en ligne', href: '/admin/collections/realisations' },
    { valeur: formations, libelle: 'formations au catalogue', href: '/admin/collections/formations' },
    { valeur: sessions.totalDocs, libelle: 'sessions à venir', href: '/admin/collections/sessions' },
    { valeur: opportunites.totalDocs, libelle: 'opportunités en cours', href: '/admin/collections/opportunites' },
    { valeur: partenaires.totalDocs, libelle: 'partenaires', href: '/admin/collections/partenaires' },
    { valeur: abonnes.totalDocs, libelle: 'abonnés à la lettre', href: '/admin/collections/abonnes' },
  ]

  const raccourcis = [
    { icone: 'actualite', href: '/admin/collections/actualites/create', libelle: 'Publier une actualité' },
    { icone: 'realisation', href: '/admin/collections/realisations/create', libelle: 'Ajouter une réalisation' },
    { icone: 'session', href: '/admin/collections/sessions/create', libelle: 'Programmer une session' },
    { icone: 'opportunite', href: '/admin/collections/opportunites/create', libelle: 'Publier une opportunité' },
    { icone: 'annonce', href: '/admin/collections/annonces/create', libelle: 'Annonce à l’équipe' },
    { icone: 'compte', href: '/admin/collections/users', libelle: 'Comptes de l’équipe' },
    { icone: 'export', href: '/api/inscriptions/export', libelle: 'Exporter les inscriptions' },
    { icone: 'export', href: '/api/abonnes/export', libelle: 'Exporter les abonnés' },
  ] as const

  const modifications = recents
    .flatMap((r, i) =>
      r.docs.map((d) => {
        const doc = d as { id: number | string; titre?: string | null; updatedAt: string; _status?: string | null }
        return { ...doc, type: COLLECTIONS_SUIVIES[i][1], collection: COLLECTIONS_SUIVIES[i][0] }
      }),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)

  return (
    <section className="adet-tdb">
      <header className="adet-tdb__entete">
        <div>
          <p className="adet-tdb__date">{jour}</p>
          <h1>
            {heure < 18 ? 'Bonjour' : 'Bonsoir'}
            {prenom ? ` ${prenom}` : ''}
          </h1>
          <p>Le back-office du site de l’ADET : ce qui attend une action, puis tout le reste.</p>
        </div>
        <div className="adet-tdb__liens">
          <a href="/fr" target="_blank" rel="noreferrer" className="adet-tdb__bouton">
            <Icone nom="site" /> Voir le site
          </a>
          <Link href="/espace" className="adet-tdb__bouton adet-tdb__bouton--plein">
            Espace pro
          </Link>
        </div>
      </header>

      <h2 className="adet-tdb__titre">À traiter</h2>
      <ul className="adet-tdb__a-traiter">
        {aTraiter.map((t) => (
          <li key={t.libelle} className={t.valeur > 0 ? 'est-alerte' : undefined}>
            <Link href={t.href}>
              <span className="adet-tdb__pastille">
                <Icone nom={t.icone} taille={22} />
              </span>
              <strong>{t.valeur}</strong>
              <span>{t.libelle}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="adet-tdb__titre">Le site en chiffres</h2>
      <ul className="adet-tdb__chiffres">
        {chiffres.map((c) => (
          <li key={c.libelle}>
            <Link href={c.href}>
              <strong>{c.valeur}</strong>
              <span>{c.libelle}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="adet-tdb__grille">
        <div className="adet-tdb__carte">
          <h2>Derniers messages</h2>
          {derniersMessages.docs.length ? (
            <ul className="adet-tdb__liste">
              {derniersMessages.docs.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/collections/messages/${m.id}`}>
                    <strong>{m.nom}</strong>
                    <span>{m.message.length > 90 ? `${m.message.slice(0, 90)}…` : m.message}</span>
                    <time dateTime={m.createdAt}>{date(m.createdAt)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adet-tdb__vide">Aucun message en attente.</p>
          )}
        </div>

        <div className="adet-tdb__carte">
          <h2>Inscriptions à confirmer</h2>
          {dernieresInscriptions.docs.length ? (
            <ul className="adet-tdb__liste">
              {dernieresInscriptions.docs.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/collections/inscriptions/${i.id}`}>
                    <strong>{i.nom}</strong>
                    <span>{typeof i.session === 'object' ? i.session.titre : ''} · {i.telephone}</span>
                    <time dateTime={i.createdAt}>{date(i.createdAt)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adet-tdb__vide">Aucune inscription en attente.</p>
          )}
        </div>

        <div className="adet-tdb__carte">
          <h2>Raccourcis</h2>
          <div className="adet-tdb__raccourcis">
            {raccourcis.map((r) => (
              <Link key={r.href} href={r.href}>
                <Icone nom={r.icone} /> {r.libelle}
              </Link>
            ))}
          </div>
        </div>

        <div className="adet-tdb__carte">
          <h2>Dernières modifications</h2>
          {modifications.length ? (
            <ul className="adet-tdb__liste">
              {modifications.map((m) => (
                <li key={`${m.collection}-${m.id}`}>
                  <Link href={`/admin/collections/${m.collection}/${m.id}`}>
                    <strong>{m.titre || 'Sans titre'}</strong>
                    <span>
                      {m.type}
                      {m._status === 'draft' ? ' · brouillon' : ''}
                    </span>
                    <time dateTime={m.updatedAt}>{date(m.updatedAt)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adet-tdb__vide">Rien n’a encore été publié.</p>
          )}
        </div>
      </div>

      <p className="adet-tdb__astuce">
        Chaque contenu existe en <strong>français</strong> et en <strong>anglais</strong> : changez de langue avec le sélecteur en haut d’une fiche. Le bouton
        <strong> Aperçu</strong> montre un brouillon tel qu’il apparaîtra sur le site.
      </p>
    </section>
  )
}
