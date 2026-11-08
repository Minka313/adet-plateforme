import type { Metadata } from 'next'
import Link from 'next/link'

import { AppelAction, EnTetePage, TitreSection } from '@/components/Blocs'
import { ClassementCommunes } from '@/components/ClassementCommunes'
import { BarresDepartements, TableauArrondissements } from '@/components/Communes'
import { Indicateurs } from '@/components/Kolda'
import { dico, lien, type Langue } from '@/i18n'
import { COULEUR_DEPARTEMENT, nomCourt, total } from '@/lib/communes'
import { formatNombre } from '@/lib/format'
import { getCommunes, getTerritoires } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const d = dico(lang).kolda
  return { title: d.enChiffresTitre, description: d.enChiffresIntro }
}

export default async function KoldaEnChiffres({ params }: Props) {
  const { lang } = await params
  const d = dico(lang).kolda
  const [territoires, communes] = await Promise.all([getTerritoires(lang), getCommunes(lang)])
  const region = territoires.find((t) => t.type === 'region')
  const departements = territoires.filter((t) => t.type === 'departement')
  const deCe = (id: number) => communes.filter((c) => c.departement === id)
  const arrondissements = new Set(communes.map((c) => c.arrondissement).filter(Boolean))

  const tuiles = [
    [formatNombre(total(communes), lang), d.tuileHabitants],
    [departements.length, d.tuileDepartements],
    [arrondissements.size, d.tuileArrondissements],
    [communes.length, d.tuileCommunes],
  ] as const

  const classement = departements
    .flatMap((dep) =>
      deCe(dep.id).map((c) => ({
        id: c.id,
        nom: c.nom,
        href: lien(lang, `/decouvrir-kolda/${dep.slug}/${c.slug}`),
        habitants: c.habitants ?? 0,
        valeur: formatNombre(c.habitants ?? 0, lang),
        dep: dep.slug ?? '',
        depNom: nomCourt(dep),
        couleur: COULEUR_DEPARTEMENT[dep.slug ?? ''],
      })),
    )
    .sort((a, b) => b.habitants - a.habitants)

  return (
    <>
      <EnTetePage
        surtitre={
          <Link href={lien(lang, '/decouvrir-kolda')} className="lien-retour">
            ← {d.retour}
          </Link>
        }
        titre={d.enChiffresTitre}
        intro={d.enChiffresIntro}
      />

      <section className="section">
        <div className="conteneur">
          <ul className="tuiles-chiffres" data-reveal>
            {tuiles.map(([valeur, libelle]) => (
              <li key={libelle}>
                <strong>{valeur}</strong>
                <span>{libelle}</span>
              </li>
            ))}
          </ul>
          <p className="source-note">{d.sourceCommunes}</p>
        </div>
      </section>

      <section className="section section--sable">
        <div className="conteneur">
          <TitreSection titre={d.repartitionTitre} />
          <BarresDepartements lignes={departements.map((dep) => ({ dep, habitants: total(deCe(dep.id)) }))} lang={lang} />
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <TitreSection titre={d.classementTitre} intro={d.classementIntro} />
          <ClassementCommunes
            communes={classement}
            departements={departements.map((dep) => ({ slug: dep.slug ?? '', nom: nomCourt(dep), couleur: COULEUR_DEPARTEMENT[dep.slug ?? ''] }))}
            toutes={d.toutes}
            libelle={d.departement}
          />
          <p className="source-note">{d.sourceCommunes}</p>
        </div>
      </section>

      <section className="section section--sable">
        <div className="conteneur">
          <TitreSection titre={d.arrondissementsTitre} intro={d.arrondissementsIntro} />
          <TableauArrondissements departements={departements} communes={communes} lang={lang} />
        </div>
      </section>

      {!!region?.indicateurs?.length && (
        <section className="section">
          <div className="conteneur">
            <TitreSection titre={d.autresReperesTitre} intro={d.chiffresIntro} />
            <Indicateurs indicateurs={region.indicateurs} lang={lang} />
          </div>
        </section>
      )}

      <AppelAction titre={d.appelTitre} texte={d.appelTexte} href={lien(lang, '/contact?objet=information')} label={d.appelBouton} />
    </>
  )
}
