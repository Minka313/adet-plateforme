import Link from 'next/link'

import { AppelAction, CarteActualite, CarteRealisation, LogoPartenaire, TitreSection, Vide } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { PhotoSite } from '@/components/PhotoSite'
import { CarteTerritoire } from '@/components/ui/Carte'
import { Icone } from '@/components/ui/Icone'
import { Lisere } from '@/components/ui/Motif'
import { dico, lien, type Langue } from '@/i18n'
import { COULEUR_DEPARTEMENT, COULEURS_CARTE, nomCourt, SLUG_PAR_DEPARTEMENT, total } from '@/lib/communes'
import { datesSession, formatNombre, placesRestantes } from '@/lib/format'
import { getAssociation, getCommunes, getFormations, getPayloadClient, getSessionsAVenir, getStructures, getTerritoires, loc } from '@/lib/payload'

export const revalidate = 60

/** Couleur de chaque axe (fils du tissage), dans l'ordre du cadre stratégique */
const COULEURS_AXES = ['#3c6ef1', '#0b7a1e', '#ffae5d', '#00586e', '#f9db5f']

export default async function Accueil({ params }: { params: Promise<{ lang: Langue }> }) {
  const { lang } = await params
  const d = dico(lang)
  const payload = await getPayloadClient()
  const [asso, territoires, communes, sessions, formations, structures, realisations, actualites, partenaires] = await Promise.all([
    getAssociation(lang),
    getTerritoires(lang),
    getCommunes(lang),
    getSessionsAVenir(lang),
    getFormations(lang),
    getStructures(lang),
    payload.find({
      collection: 'realisations',
      where: { _status: { equals: 'published' } },
      sort: ['-enAvant', '-dateDebut'],
      limit: 3,
      depth: 1,
      ...loc(lang),
    }),
    payload.find({ collection: 'actualites', where: { _status: { equals: 'published' } }, limit: 3, depth: 1, ...loc(lang) }),
    payload.find({ collection: 'partenaires', limit: 24, depth: 1, ...loc(lang) }),
  ])

  const departements = territoires.filter((t) => t.type === 'departement')
  const lignesDeps = departements.map((dep) => {
    const siennes = communes.filter((c) => c.departement === dep.id)
    return { dep, habitants: total(siennes), nombre: siennes.length }
  })
  const slugs = new Set(departements.map((t) => t.slug))
  const liensCarte = Object.fromEntries(
    Object.entries(SLUG_PAR_DEPARTEMENT)
      .filter(([, slug]) => slugs.has(slug))
      .map(([nom, slug]) => [nom, lien(lang, `/decouvrir-kolda/${slug}`)]),
  )

  const prochaine = sessions.find((s) => s.etat === 'ouverte') ?? sessions[0]
  const formationProchaine = prochaine && formations.find((f) => f.id === prochaine.formation)

  const portes = [
    { cle: 'former', href: '/se-former', couleur: '#3c6ef1', chiffre: sessions.length },
    { cle: 'appui', href: '/opportunites', couleur: '#0b7a1e', chiffre: structures.length },
    { cle: 'territoire', href: '/decouvrir-kolda', couleur: '#ffae5d', chiffre: communes.length },
  ] as const

  return (
    <>
      {/* ---------- Hero : le territoire d'abord ---------- */}
      <section className="accueil-hero">
        <div className="conteneur accueil-hero__grille">
          <div className="accueil-hero__texte">
            <p className="surtitre">{d.accueil.lieu}</p>
            <h1>{asso.accroche || asso.nom}</h1>
            {asso.introduction && <p className="accueil-hero__intro">{asso.introduction}</p>}
            <div className="accueil-hero__actions">
              <Link href={lien(lang, '/se-former')} className="bouton bouton--vert bouton--grand">
                {d.accueil.trouverFormation}
              </Link>
              <Link href={lien(lang, '/a-propos')} className="bouton bouton--contour bouton--grand">
                {d.accueil.decouvrir}
              </Link>
            </div>
          </div>
          <div className="accueil-hero__carte">
            <CarteTerritoire titre={d.accueil.territoireTitre} liens={liensCarte} couleurs={COULEURS_CARTE} />
            {!!lignesDeps.length && (
              <>
                <ul className="accueil-hero__depts">
                  {lignesDeps.map(({ dep, habitants, nombre }) => (
                    <li key={dep.id}>
                      <Link href={lien(lang, `/decouvrir-kolda/${dep.slug}`)}>
                        <span className="puce-couleur" style={{ background: COULEUR_DEPARTEMENT[dep.slug ?? ''] }} aria-hidden="true" />
                        <strong>{nomCourt(dep)}</strong>
                        <span>
                          {formatNombre(habitants, lang)} {d.kolda.habitants} · {d.accueil.communesN.replace('{n}', String(nombre))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="source-note">{d.accueil.carteLegende}</p>
              </>
            )}
          </div>
        </div>
      </section>
      <Lisere />

      {/* ---------- Prochaine formation ---------- */}
      {prochaine && formationProchaine && (
        <section className="prochaine">
          <div className="conteneur prochaine__barre">
            <p className="prochaine__titre">
              {d.accueil.prochaineFormation} : {formationProchaine.titre}
            </p>
            <p className="prochaine__details">
              {datesSession(prochaine.dateDebut, prochaine.dateFin, lang)}
              {prochaine.lieu && ` · ${prochaine.lieu}`}
              {prochaine.etat === 'ouverte' && prochaine.restantes !== null && ` · ${placesRestantes(prochaine.restantes, d.formations)}`}
            </p>
            {prochaine.etat === 'ouverte' && (
              <Link href={lien(lang, `/se-former/inscription/${prochaine.id}`)} className="bouton bouton--or">
                {d.formations.inscrire}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ---------- Par où commencer ---------- */}
      <section className="section">
        <div className="conteneur">
          <TitreSection titre={d.accueil.commencerTitre} />
          <div className="portes">
            {portes.map((p, i) => {
              const t = d.accueil.portes[p.cle]
              return (
                <Link key={p.cle} href={lien(lang, p.href)} className="porte" style={{ ['--c' as string]: p.couleur, ['--i' as string]: i }} data-reveal>
                  <span className="porte__public">{t.public}</span>
                  <span className="porte__titre">{t.titre}</span>
                  <span className="porte__texte">{t.texte}</span>
                  {p.chiffre > 0 && (
                    <span className="porte__chiffre">
                      <strong>{p.chiffre}</strong> {t.legende}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- Raison d'être ---------- */}
      {(asso.constat || asso.reponse) && (
        <section className="section section--sable" id="raison-etre">
          <div className="conteneur">
            <TitreSection surtitre={d.accueil.raisonEtre} titre={asso.zoneTitre || d.accueil.raisonEtre} />
            <div className="raison">
              {asso.constat && (
                <div className="raison__bloc" data-reveal>
                  <p className="raison__etiquette">{d.accueil.constat}</p>
                  <p className="raison__texte">{asso.constat}</p>
                </div>
              )}
              {asso.reponse && (
                <div className="raison__bloc raison__bloc--reponse" data-reveal style={{ ['--i' as string]: 1 }}>
                  <p className="raison__etiquette">{d.accueil.reponse}</p>
                  <p className="raison__texte">{asso.reponse}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Axes : cinq fils ---------- */}
      {!!asso.axes?.length && (
        <section className="section">
          <div className="conteneur">
            <TitreSection titre={d.accueil.axesTitre} intro={d.accueil.axesIntro} lienHref={lien(lang, '/a-propos#axes')} lienLabel={d.accueil.voirDetail} />
            <ol className="fils">
              {asso.axes.map((axe, i) => (
                <li key={axe.id} className="fil" style={{ ['--c' as string]: COULEURS_AXES[i % COULEURS_AXES.length] }} data-reveal>
                  <span className="fil__trait" aria-hidden="true" />
                  <h3>{axe.titre}</h3>
                  {axe.objectifs?.[0] && <p>{axe.objectifs[0].texte}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ---------- En images ---------- */}
      <section className="section section--court">
        <div className="conteneur">
          <TitreSection surtitre={d.accueil.imagesSurtitre} titre={d.accueil.imagesTitre} />
          <div className="mosaique" data-reveal>
            <PhotoSite emplacement="accueil1" lang={lang} className="mosaique__grande" sizes="(max-width: 800px) 100vw, 60vw" />
            <PhotoSite emplacement="accueil2" lang={lang} sizes="(max-width: 800px) 50vw, 40vw" />
            <PhotoSite emplacement="accueil3" lang={lang} sizes="(max-width: 800px) 50vw, 40vw" />
          </div>
        </div>
      </section>

      {/* ---------- Réalisations ---------- */}
      <section className="section section--sable">
        <div className="conteneur">
          <TitreSection
            surtitre={d.nav.realisations}
            titre={d.accueil.realisationsTitre}
            intro={d.accueil.realisationsIntro}
            lienHref={realisations.totalDocs > 0 ? lien(lang, '/realisations') : undefined}
            lienLabel={d.accueil.toutesRealisations}
          />
          {realisations.docs.length ? (
            <div className="grille-cartes">
              {realisations.docs.map((r, i) => (
                <CarteRealisation key={r.id} r={r} lang={lang} i={i} />
              ))}
            </div>
          ) : (
            <Vide>{d.accueil.realisationsVide}</Vide>
          )}
        </div>
      </section>

      {/* ---------- Mot du directeur ---------- */}
      {asso.citation && (
        <section className="section citation">
          <div className="conteneur citation__contenu" data-reveal>
            <Icone nom="guillemets" taille={56} className="citation__guillemets" />
            <blockquote>
              <p>{asso.citation}</p>
            </blockquote>
            {(asso.citationAuteur || asso.citationFonction) && (
              <figcaption className="citation__auteur">
                {asso.citationPhoto && typeof asso.citationPhoto === 'object' && (
                  <Picture media={asso.citationPhoto} taille="vignette" className="citation__photo" sizes="64px" />
                )}
                <span>
                  <strong>{asso.citationAuteur}</strong>
                  {asso.citationFonction && <span>{asso.citationFonction}</span>}
                </span>
              </figcaption>
            )}
          </div>
        </section>
      )}

      {/* ---------- Actualités ---------- */}
      {actualites.docs.length > 0 && (
        <section className="section">
          <div className="conteneur">
            <TitreSection titre={d.accueil.actualitesTitre} lienHref={lien(lang, '/actualites')} lienLabel={d.accueil.toutesActualites} />
            <div className="grille-cartes grille-cartes--une">
              {actualites.docs.map((a, i) => (
                <CarteActualite key={a.id} a={a} lang={lang} i={i} une={i === 0 && actualites.docs.length > 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Partenaires ---------- */}
      {partenaires.docs.length > 0 && (
        <section className="section section--court">
          <div className="conteneur">
            <TitreSection titre={d.accueil.partenairesTitre} lienHref={lien(lang, '/partenaires')} lienLabel={d.nav.partenaires} />
          </div>
          <div className="defilant" data-reveal>
            <ul className="defilant__piste">
              {[...partenaires.docs, ...partenaires.docs].map((p, i) => (
                <LogoPartenaire key={`${p.id}-${i}`} p={p} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <AppelAction titre={d.accueil.appelTitre} texte={d.accueil.appelTexte} href={lien(lang, '/contact')} label={d.accueil.appelBouton} />
    </>
  )
}
