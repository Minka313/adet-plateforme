import Link from 'next/link'
import type { ServerProps } from 'payload'

/**
 * Accueil du back-office : ce qui demande une action (messages, brouillons),
 * les chiffres du site et des raccourcis pour les tâches les plus fréquentes.
 */
export default async function TableauDeBord({ payload, user }: ServerProps) {
  const brouillon = { _status: { equals: 'draft' } } as const
  const publie = { _status: { equals: 'published' } } as const
  const [aTraiter, derniers, rBrouillons, aBrouillons, rPubliees, aPubliees, abonnes, partenaires] = await Promise.all([
    payload.count({ collection: 'messages', where: { traite: { not_equals: true } } }),
    payload.find({ collection: 'messages', where: { traite: { not_equals: true } }, limit: 4, depth: 0, sort: '-createdAt' }),
    payload.count({ collection: 'realisations', where: brouillon }),
    payload.count({ collection: 'actualites', where: brouillon }),
    payload.count({ collection: 'realisations', where: publie }),
    payload.count({ collection: 'actualites', where: publie }),
    payload.count({ collection: 'abonnes', where: { actif: { equals: true } } }),
    payload.count({ collection: 'partenaires' }),
  ])
  const prenom = (user as { nom?: string | null } | undefined)?.nom?.split(' ')[0]
  const heure = new Date().getHours()

  const tuiles = [
    { valeur: aTraiter.totalDocs, libelle: 'messages à traiter', href: '/admin/collections/messages?where[traite][not_equals]=true', alerte: aTraiter.totalDocs > 0 },
    { valeur: rBrouillons.totalDocs + aBrouillons.totalDocs, libelle: 'brouillons en attente', href: '/admin/collections/actualites?where[_status][equals]=draft', alerte: false },
    { valeur: rPubliees.totalDocs, libelle: 'réalisations publiées', href: '/admin/collections/realisations' },
    { valeur: aPubliees.totalDocs, libelle: 'actualités publiées', href: '/admin/collections/actualites' },
    { valeur: partenaires.totalDocs, libelle: 'partenaires', href: '/admin/collections/partenaires' },
    { valeur: abonnes.totalDocs, libelle: 'abonnés newsletter', href: '/admin/collections/abonnes' },
  ]

  const raccourcis = [
    { href: '/admin/collections/actualites/create', libelle: '＋ Nouvelle actualité' },
    { href: '/admin/collections/realisations/create', libelle: '＋ Nouvelle réalisation' },
    { href: '/admin/collections/partenaires/create', libelle: '＋ Nouveau partenaire' },
    { href: '/admin/globals/association', libelle: 'Modifier la présentation' },
    { href: '/api/abonnes/export', libelle: '⬇ Exporter les abonnés (CSV)' },
    { href: '/fr', libelle: '↗ Voir le site' },
  ]

  return (
    <section className="adet-tdb">
      <div className="adet-tdb__entete">
        <div>
          <p className="adet-tdb__surtitre">Espace membres ADET</p>
          <h1>
            {heure < 18 ? 'Bonjour' : 'Bonsoir'}
            {prenom ? ` ${prenom}` : ''} 👋
          </h1>
          <p>Voici ce qui se passe sur la plateforme aujourd’hui.</p>
        </div>
      </div>

      <ul className="adet-tdb__tuiles">
        {tuiles.map((t) => (
          <li key={t.libelle} className={t.alerte ? 'est-alerte' : undefined}>
            <Link href={t.href}>
              <strong>{t.valeur}</strong>
              <span>{t.libelle}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="adet-tdb__grille">
        <div className="adet-tdb__carte">
          <h2>Derniers messages non traités</h2>
          {derniers.docs.length ? (
            <ul className="adet-tdb__messages">
              {derniers.docs.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/collections/messages/${m.id}`}>
                    <strong>{m.nom}</strong>
                    <span>{m.message.slice(0, 90)}{m.message.length > 90 ? '…' : ''}</span>
                    <time>{new Date(m.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adet-tdb__vide">Aucun message en attente. 🎉</p>
          )}
        </div>
        <div className="adet-tdb__carte">
          <h2>Raccourcis</h2>
          <div className="adet-tdb__raccourcis">
            {raccourcis.map((r) => (
              <a key={r.href} href={r.href} target={r.href.startsWith('/fr') ? '_blank' : undefined} rel="noreferrer">
                {r.libelle}
              </a>
            ))}
          </div>
          <p className="adet-tdb__astuce">
            Astuce : chaque contenu existe en <strong>français</strong> et en <strong>anglais</strong>. Changez de langue avec le sélecteur en haut d’une fiche. Le bouton <strong>Aperçu</strong> montre un brouillon tel qu’il apparaîtra sur le site.
          </p>
        </div>
      </div>
    </section>
  )
}
