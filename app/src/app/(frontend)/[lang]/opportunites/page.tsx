import type { Metadata } from 'next'

import { AppelAction, EnTetePage, TitreSection } from '@/components/Blocs'
import { CarteOpportunite, CarteStructure, EncadreVide } from '@/components/Opportunites'
import { PhotoSite } from '@/components/PhotoSite'
import { dico, lien, type Langue } from '@/i18n'
import { getOpportunitesEnCours, getStructures } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

// Ordre d'affichage des familles de structures (la formation est présentée dans « Se former »)
const FAMILLES = ['financement', 'accompagnement', 'emploi'] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const d = dico(lang).opportunites
  return { title: d.titre, description: d.intro }
}

export default async function Opportunites({ params }: Props) {
  const { lang } = await params
  const d = dico(lang).opportunites
  const [opportunites, structures] = await Promise.all([getOpportunitesEnCours(lang), getStructures(lang)])

  return (
    <>
      <EnTetePage surtitre={d.titre} titre={d.titre} intro={d.intro} />

      <section className="section">
        <div className="conteneur">
          <PhotoSite emplacement="opportunites" lang={lang} className="bandeau-photo" sizes="(max-width: 1240px) 100vw, 1200px" priority />
          <TitreSection titre={d.enCoursTitre} intro={d.enCoursIntro} />
          {opportunites.length ? (
            <div className="grille-opportunites">
              {opportunites.map((o, i) => (
                <CarteOpportunite key={o.id} o={o} lang={lang} i={i} />
              ))}
            </div>
          ) : (
            <EncadreVide titre={d.aucune} texte={d.aucuneTexte}>
              <a href="#newsletter" className="bouton bouton--or">
                {d.prevenu}
              </a>
              <a href={lien(lang, '/contact?objet=information')} className="bouton bouton--clair">
                {d.signalerBouton}
              </a>
            </EncadreVide>
          )}
        </div>
      </section>

      {!!structures.length && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={d.structuresTitre} intro={d.structuresIntro} />
            {FAMILLES.map((famille) => {
              const liste = structures.filter((s) => s.type === famille)
              if (!liste.length) return null
              return (
                <div key={famille} className="famille-structures">
                  <h3 className="famille-structures__titre">{d.types[famille]}</h3>
                  <div className="grille-structures">
                    {liste.map((s, i) => (
                      <CarteStructure key={s.id} s={s} lang={lang} i={i} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <AppelAction titre={d.signalerTitre} texte={d.signalerTexte} href={lien(lang, '/contact?objet=information')} label={d.signalerBouton} />
    </>
  )
}
