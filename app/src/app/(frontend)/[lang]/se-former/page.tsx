import type { Metadata } from 'next'
import Link from 'next/link'

import { EnTetePage, TitreSection } from '@/components/Blocs'
import { CarteFormation, CarteStructure, EncadreVide } from '@/components/Opportunites'
import { PhotoSite } from '@/components/PhotoSite'
import { dico, lien, type Langue } from '@/i18n'
import { getFormations, getSessionsAVenir, getStructures } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const d = dico(lang).formations
  return { title: d.titre, description: d.intro }
}

export default async function SeFormer({ params }: Props) {
  const { lang } = await params
  const d = dico(lang).formations
  const [catalogue, sessions, structures] = await Promise.all([getFormations(lang), getSessionsAVenir(lang), getStructures(lang)])
  const organismes = structures.filter((s) => s.type === 'formation')
  const sessionsDe = (id: number) => sessions.filter((s) => s.formation === id)
  // Les formations qui ont une session à venir d'abord, de la plus proche à la plus lointaine
  const rang = (id: number) => {
    const i = sessions.findIndex((s) => s.formation === id)
    return i === -1 ? sessions.length : i
  }
  const formations = [...catalogue].sort((a, b) => rang(a.id) - rang(b.id))

  return (
    <>
      <EnTetePage surtitre={d.titre} titre={d.titre} intro={d.intro} />

      <section className="section">
        <div className="conteneur">
          <PhotoSite emplacement="formations" lang={lang} className="bandeau-photo" sizes="(max-width: 1240px) 100vw, 1200px" priority />
          <TitreSection titre={d.catalogueTitre} />
          {formations.length ? (
            <div className="grille-opportunites">
              {formations.map((f, i) => (
                <CarteFormation key={f.id} f={f} sessions={sessionsDe(f.id)} lang={lang} i={i} />
              ))}
            </div>
          ) : (
            <EncadreVide titre={d.catalogueVide} texte={d.catalogueVideTexte}>
              <Link href={lien(lang, '/contact?objet=formation')} className="bouton bouton--or">
                {d.besoinBouton}
              </Link>
            </EncadreVide>
          )}
        </div>
      </section>

      {!!organismes.length && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={d.financerTitre} intro={d.financerIntro} />
            <div className="grille-structures">
              {organismes.map((s, i) => (
                <CarteStructure key={s.id} s={s} lang={lang} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
