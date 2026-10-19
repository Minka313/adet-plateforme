import Link from 'next/link'

import { CarteActualite, CarteRealisation, LogoPartenaire } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { getAssociation, getPayloadClient } from '@/lib/payload'

export const revalidate = 60

export default async function Accueil() {
  const payload = await getPayloadClient()
  const [asso, realisations, actualites, partenaires] = await Promise.all([
    getAssociation(),
    payload.find({
      collection: 'realisations',
      where: { _status: { equals: 'published' } },
      sort: ['-enAvant', '-dateDebut'],
      limit: 3,
      depth: 1,
    }),
    payload.find({ collection: 'actualites', where: { _status: { equals: 'published' } }, limit: 3, depth: 1 }),
    payload.find({ collection: 'partenaires', limit: 12, depth: 1 }),
  ])

  return (
    <>
      <section className="hero">
        <div className="conteneur hero__grille">
          <div>
            <p className="surtitre">{asso.nom}</p>
            <h1>{asso.accroche || asso.sigle}</h1>
            {asso.introduction && <p className="hero__intro">{asso.introduction}</p>}
            <div className="hero__actions">
              <Link href="/a-propos" className="bouton">
                Découvrir l&apos;ADET
              </Link>
              <Link href="/contact" className="bouton bouton--contour">
                Devenir partenaire
              </Link>
            </div>
          </div>
          <div className="hero__visuel">
            {asso.imageAccueil && typeof asso.imageAccueil === 'object' ? (
              <Picture media={asso.imageAccueil} taille="large" priority sizes="(max-width: 900px) 100vw, 45vw" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/brand/adet-symbole.svg" alt="" className="hero__symbole" width={250} height={400} />
            )}
          </div>
        </div>
        {!!asso.chiffres?.length && (
          <div className="conteneur">
            <ul className="chiffres">
              {asso.chiffres.map((c) => (
                <li key={c.id}>
                  <strong>{c.valeur}</strong>
                  <span>{c.libelle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="section">
        <div className="conteneur deux-colonnes">
          <div className="encart encart--bleu">
            <h2>Notre vision</h2>
            <p>{asso.vision}</p>
          </div>
          <div className="encart encart--vert">
            <h2>Notre mission</h2>
            <p>{asso.mission}</p>
          </div>
        </div>
      </section>

      {!!asso.axes?.length && (
        <section className="section section--teinte">
          <div className="conteneur">
            <div className="section__entete">
              <h2>Nos {asso.axes.length} axes d&apos;intervention</h2>
              <Link href="/a-propos#axes">Voir le détail →</Link>
            </div>
            <ol className="axes">
              {asso.axes.map((axe, i) => (
                <li key={axe.id} className="axe">
                  <span className="axe__num">{i + 1}</span>
                  <h3>{axe.titre}</h3>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section">
        <div className="conteneur">
          <div className="section__entete">
            <h2>Nos réalisations</h2>
            {realisations.totalDocs > 0 && <Link href="/realisations">Toutes les réalisations →</Link>}
          </div>
          {realisations.docs.length ? (
            <div className="grille-cartes">
              {realisations.docs.map((r) => (
                <CarteRealisation key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <p className="vide">Les premières réalisations de l&apos;ADET seront bientôt présentées ici.</p>
          )}
        </div>
      </section>

      {actualites.docs.length > 0 && (
        <section className="section section--teinte">
          <div className="conteneur">
            <div className="section__entete">
              <h2>Actualités</h2>
              <Link href="/actualites">Toutes les actualités →</Link>
            </div>
            <div className="grille-cartes">
              {actualites.docs.map((a) => (
                <CarteActualite key={a.id} a={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {partenaires.docs.length > 0 && (
        <section className="section">
          <div className="conteneur">
            <div className="section__entete">
              <h2>Ils nous accompagnent</h2>
              <Link href="/partenaires">Nos partenaires →</Link>
            </div>
            <ul className="partenaires">
              {partenaires.docs.map((p) => (
                <LogoPartenaire key={p.id} p={p} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="appel">
        <div className="conteneur appel__contenu">
          <div>
            <h2>Agissons ensemble pour Kolda et la Casamance</h2>
            <p>Collectivité, entreprise, ONG, jeune porteur de projet : contactez-nous pour construire des projets utiles au territoire.</p>
          </div>
          <Link href="/contact" className="bouton bouton--jaune">
            Prendre contact
          </Link>
        </div>
      </section>
    </>
  )
}
