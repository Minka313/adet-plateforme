import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppelAction, EnTetePage, TitreSection } from '@/components/Blocs'
import { CarteDepartement, CarteFiliere, Indicateurs, Paragraphes, Reperes } from '@/components/Kolda'
import { Picture } from '@/components/Picture'
import { Icone } from '@/components/ui/Icone'
import { dico, lien, LANGUES, type Langue } from '@/i18n'
import { getFilieres, getTerritoires } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue; slug: string }> }

/** Une fiche est soit un département (collection Territoires), soit une filière */
async function trouverFiche(lang: Langue, slug: string) {
  const [territoires, filieres] = await Promise.all([getTerritoires(lang), getFilieres(lang)])
  const territoire = territoires.find((t) => t.slug === slug && t.type === 'departement')
  if (territoire) return { territoire, autres: territoires.filter((t) => t.type === 'departement' && t.id !== territoire.id) }
  const filiere = filieres.find((f) => f.slug === slug)
  if (filiere) return { filiere, autresFilieres: filieres.filter((f) => f.id !== filiere.id) }
  return null
}

export async function generateStaticParams() {
  const [territoires, filieres] = await Promise.all([getTerritoires('fr'), getFilieres('fr')])
  const slugs = [...territoires.filter((t) => t.type === 'departement'), ...filieres].map((x) => x.slug).filter(Boolean)
  return LANGUES.flatMap((lang) => slugs.map((slug) => ({ lang, slug: slug as string })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const f = await trouverFiche(lang, slug)
  const fiche = f?.territoire ?? f?.filiere
  return fiche ? { title: fiche.nom, description: fiche.resume } : {}
}

export default async function FicheKolda({ params }: Props) {
  const { lang, slug } = await params
  const d = dico(lang).kolda
  const f = await trouverFiche(lang, slug)
  if (!f) notFound()
  const fiche = f.territoire ?? f.filiere
  if (!fiche) notFound()

  return (
    <>
      <EnTetePage
        surtitre={
          <Link href={lien(lang, '/decouvrir-kolda')} className="lien-retour">
            ← {d.retour}
          </Link>
        }
        titre={fiche.nom}
        intro={fiche.resume}
      />

      <section className="section">
        <div className="conteneur">
          {fiche.photo && typeof fiche.photo === 'object' && (
            <figure className="photo-site bandeau-photo">
              <Picture media={fiche.photo} taille="large" priority sizes="(max-width: 1240px) 100vw, 1200px" />
              {fiche.photo.credit && <figcaption className="photo-site__credit">{fiche.photo.credit}</figcaption>}
            </figure>
          )}
          <div className="fiche">
            <div data-reveal>
              <Paragraphes texte={fiche.presentation} />
            </div>
            <Reperes reperes={fiche.reperes} lang={lang} />
          </div>
        </div>
      </section>

      {!!fiche.indicateurs?.length && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={d.chiffresTitre.replace(/La région|The region/, fiche.nom)} intro={d.chiffresIntro} />
            <Indicateurs indicateurs={fiche.indicateurs} lang={lang} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="conteneur">
          {f.autres && (
            <>
              <TitreSection titre={d.autresDepartements} />
              <div className="liste-depts liste-depts--ligne">
                {f.autres.map((t, i) => (
                  <CarteDepartement key={t.id} t={t} lang={lang} i={i} />
                ))}
              </div>
            </>
          )}
          {f.autresFilieres && (
            <>
              <TitreSection titre={d.autresFilieres} />
              <div className="grille-cartes">
                {f.autresFilieres.map((x, i) => (
                  <CarteFiliere key={x.id} f={x} lang={lang} i={i} />
                ))}
              </div>
            </>
          )}
          <p className="fiche__retour">
            <Link href={lien(lang, '/decouvrir-kolda')} className="lien-fleche">
              {d.retour} <Icone nom="fleche" taille={18} />
            </Link>
          </p>
        </div>
      </section>

      <AppelAction titre={d.appelTitre} texte={d.appelTexte} href={lien(lang, '/contact?objet=information')} label={d.appelBouton} />
    </>
  )
}
