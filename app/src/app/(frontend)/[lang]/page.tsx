import Link from 'next/link'

import { AppelAction, CarteActualite, CarteRealisation, LogoPartenaire, TitreSection, Vide } from '@/components/Blocs'
import { Picture } from '@/components/Picture'
import { PhotoSite } from '@/components/PhotoSite'
import { CarteConstellation, CarteSenegal, CarteTerritoire } from '@/components/ui/Carte'
import { Etoiles } from '@/components/ui/Etoiles'
import { Icone } from '@/components/ui/Icone'
import { Lisere, Motif } from '@/components/ui/Motif'
import { AXE_PAR_INDEX } from '@/fields/axe'
import { dico, lien, type Langue } from '@/i18n'
import { getAssociation, getPayloadClient, loc } from '@/lib/payload'

export const revalidate = 60

export default async function Accueil({ params }: { params: Promise<{ lang: Langue }> }) {
  const { lang } = await params
  const d = dico(lang)
  const payload = await getPayloadClient()
  const [asso, realisations, actualites, partenaires] = await Promise.all([
    getAssociation(lang),
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
  const photoHero = asso.imageAccueil && typeof asso.imageAccueil === 'object' ? asso.imageAccueil : null

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={`hero ${photoHero ? 'hero--photo' : ''}`}>
        {photoHero && <Picture media={photoHero} taille="large" priority sizes="100vw" className="hero__photo" />}
        <Motif couleur="#fff" opacite={0.045} taille={64} />
        <Etoiles className="hero__etoiles" />
        <div className="conteneur hero__grille">
          <div className="hero__texte">
            <p className="surtitre surtitre--or hero__lieu">
              <Icone nom="lieu" taille={16} /> {d.accueil.lieu}
            </p>
            <h1>{asso.accroche || asso.nom}</h1>
            {asso.introduction && <p className="hero__intro">{asso.introduction}</p>}
            <div className="hero__actions">
              <Link href={lien(lang, '/a-propos')} className="bouton bouton--or bouton--grand">
                {d.accueil.decouvrir} <Icone nom="fleche" taille={20} />
              </Link>
              <Link href={lien(lang, '/contact?objet=partenariat')} className="bouton bouton--clair bouton--grand">
                {d.accueil.devenirPartenaire}
              </Link>
            </div>
          </div>
          {!photoHero && (
            <div className="hero__carte">
              <CarteConstellation />
            </div>
          )}
        </div>
        {!!asso.chiffres?.length && (
          <div className="conteneur">
            <ul className="hero__chiffres">
              {asso.chiffres.map((c, i) => (
                <li key={c.id} style={{ ['--i' as string]: i }}>
                  <strong data-compte={c.valeur}>{c.valeur}</strong>
                  <span>{c.libelle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <a href="#raison-etre" className="hero__defiler" aria-label={d.accueil.defiler}>
          <Icone nom="flecheBas" taille={20} />
        </a>
      </section>
      <Lisere />

      {/* ---------- Raison d'être ---------- */}
      {(asso.constat || asso.reponse) && (
        <section className="section" id="raison-etre">
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

      {/* ---------- Vision / mission ---------- */}
      <section className="section section--sable">
        <div className="conteneur vision-mission">
          <div className="vm" data-reveal>
            <p className="vm__etiquette">{d.accueil.vision}</p>
            <p className="vm__texte vm__texte--grand">{asso.vision}</p>
          </div>
          <div className="vm vm--mission" data-reveal style={{ ['--i' as string]: 1 }}>
            <p className="vm__etiquette">{d.accueil.mission}</p>
            <p className="vm__texte">{asso.mission}</p>
          </div>
        </div>
      </section>

      {/* ---------- Axes ---------- */}
      {!!asso.axes?.length && (
        <section className="section section--nuit">
          <Motif couleur="#fff" opacite={0.04} taille={56} />
          <div className="conteneur">
            <TitreSection
              clair
              surtitre={`${asso.axes.length} ${lang === 'fr' ? 'axes stratégiques' : 'strategic pillars'}`}
              titre={d.accueil.axesTitre}
              intro={d.accueil.axesIntro}
              lienHref={lien(lang, '/a-propos#axes')}
              lienLabel={d.accueil.voirDetail}
            />
            <ol className="axes">
              {asso.axes.map((axe, i) => (
                <li key={axe.id} className={`axe axe--${AXE_PAR_INDEX[i] ?? 'capacites'}`} data-reveal style={{ ['--i' as string]: i }}>
                  <div className="axe__tete">
                    <span className="axe__icone">
                      <Icone nom={AXE_PAR_INDEX[i] ?? 'capacites'} taille={28} />
                    </span>
                    <span className="axe__num">0{i + 1}</span>
                  </div>
                  <h3>{axe.titre}</h3>
                  {axe.objectifs?.[0] && <p>{axe.objectifs[0].texte}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ---------- Territoire ---------- */}
      <section className="section territoire">
        <div className="conteneur territoire__grille">
          <div className="territoire__texte" data-reveal>
            <p className="surtitre">{d.accueil.territoireSurtitre}</p>
            <h2>{d.accueil.territoireTitre}</h2>
            <p>{d.accueil.territoireTexte}</p>
            {!!asso.regions?.length && (
              <div className="territoire__regions">
                <p className="raison__etiquette">{d.accueil.regionsPrioritaires}</p>
                <ul>
                  {asso.regions.map((r) => (
                    <li key={r.id}>{r.nom}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="territoire__situation">
              <CarteSenegal titre="Sénégal – Casamance" />
            </div>
          </div>
          <div className="territoire__carte" data-reveal style={{ ['--i' as string]: 1 }}>
            <CarteTerritoire titre={d.accueil.territoireTitre} />
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

      <AppelAction
        titre={d.accueil.appelTitre}
        texte={d.accueil.appelTexte}
        href={lien(lang, '/contact')}
        label={d.accueil.appelBouton}
      />
    </>
  )
}
