import type { Metadata } from 'next'

import { AppelAction, EnTetePage, TitreSection } from '@/components/Blocs'
import { CarteDepartement, CarteFiliere, Indicateurs, Paragraphes, Reperes } from '@/components/Kolda'
import { PhotoSite } from '@/components/PhotoSite'
import { CarteTerritoire } from '@/components/ui/Carte'
import { dico, lien, type Langue } from '@/i18n'
import { getFilieres, getTerritoires } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

const RAPPORT_ANSD =
  'https://www.ansd.sn/sites/default/files/recensements/rapport/RGPH-5%20RR_KOLDA_27112025_Version%20Formate%CC%81%20ok_Avril%202026_0.pdf'

// Noms des départements dans les données de la carte → slug de leur fiche
const SLUG_PAR_DEPARTEMENT: Record<string, string> = {
  Kolda: 'kolda',
  Vélingara: 'velingara',
  'Médina Yoro Foulah': 'medina-yoro-foulah',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const d = dico(lang).kolda
  return { title: d.surtitre, description: d.intro }
}

export default async function DecouvrirKolda({ params }: Props) {
  const { lang } = await params
  const d = dico(lang).kolda
  const [territoires, filieres] = await Promise.all([getTerritoires(lang), getFilieres(lang)])
  const region = territoires.find((t) => t.type === 'region')
  const departements = territoires.filter((t) => t.type === 'departement')
  const slugs = new Set(departements.map((t) => t.slug))
  const liensCarte = Object.fromEntries(
    Object.entries(SLUG_PAR_DEPARTEMENT)
      .filter(([, slug]) => slugs.has(slug))
      .map(([nom, slug]) => [nom, lien(lang, `/decouvrir-kolda/${slug}`)]),
  )

  return (
    <>
      <EnTetePage surtitre={d.surtitre} titre={region?.nom || d.titre} intro={region?.resume || d.intro} />

      <section className="section">
        <div className="conteneur">
          <PhotoSite emplacement="kolda" lang={lang} className="bandeau-photo" sizes="(max-width: 1240px) 100vw, 1200px" priority />
          {region && (
            <div className="fiche">
              <div data-reveal>
                <Paragraphes texte={region.presentation} />
              </div>
              <Reperes reperes={region.reperes} lang={lang} />
            </div>
          )}
        </div>
      </section>

      {!!region?.indicateurs?.length && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={d.chiffresTitre} intro={d.chiffresIntro} />
            <Indicateurs indicateurs={region.indicateurs} lang={lang} />
          </div>
        </section>
      )}

      {!!departements.length && (
        <section className="section territoire">
          <div className="conteneur territoire__grille">
            <div>
              <TitreSection titre={d.departementsTitre} intro={d.departementsIntro} />
              <div className="liste-depts">
                {departements.map((t, i) => (
                  <CarteDepartement key={t.id} t={t} lang={lang} i={i} />
                ))}
              </div>
            </div>
            <div className="territoire__carte" data-reveal>
              <CarteTerritoire titre={d.departementsTitre} liens={liensCarte} />
            </div>
          </div>
        </section>
      )}

      {!!filieres.length && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={d.filieresTitre} intro={d.filieresIntro} />
            <div className="grille-cartes">
              {filieres.map((f, i) => (
                <CarteFiliere key={f.id} f={f} lang={lang} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--court">
        <div className="conteneur conteneur--texte sources" data-reveal>
          <h2>{d.sourcesTitre}</h2>
          <p>{d.sourcesTexte}</p>
          <a href={RAPPORT_ANSD} rel="noopener noreferrer" target="_blank" className="lien-fleche">
            {d.sourcesLien}
          </a>
        </div>
      </section>

      <AppelAction titre={d.appelTitre} texte={d.appelTexte} href={lien(lang, '/contact?objet=information')} label={d.appelBouton} />
    </>
  )
}
