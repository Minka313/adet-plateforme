import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppelAction, EnTetePage, TitreSection } from '@/components/Blocs'
import { Indicateurs, Paragraphes, Reperes } from '@/components/Kolda'
import { Picture } from '@/components/Picture'
import { Icone } from '@/components/ui/Icone'
import { dico, lien, LANGUES, type Langue } from '@/i18n'
import { nomCourt, total } from '@/lib/communes'
import { formatNombre, formatPart } from '@/lib/format'
import { getCommunes, getTerritoires } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue; slug: string; commune: string }> }

/** La commune et son département, si l'adresse est cohérente (/decouvrir-kolda/<département>/<commune>) */
async function trouver(lang: Langue, slugDep: string, slugCommune: string) {
  const [territoires, communes] = await Promise.all([getTerritoires(lang), getCommunes(lang)])
  const dep = territoires.find((t) => t.type === 'departement' && t.slug === slugDep)
  const commune = dep && communes.find((c) => c.slug === slugCommune && c.departement === dep.id)
  if (!dep || !commune) return null
  return { dep, commune, voisines: communes.filter((c) => c.departement === dep.id && c.id !== commune.id), toutesDuDep: communes.filter((c) => c.departement === dep.id) }
}

export async function generateStaticParams() {
  const [territoires, communes] = await Promise.all([getTerritoires('fr'), getCommunes('fr')])
  const deps = new Map(territoires.filter((t) => t.type === 'departement').map((t) => [t.id, t.slug]))
  return LANGUES.flatMap((lang) =>
    communes.filter((c) => deps.get(c.departement as number)).map((c) => ({ lang, slug: deps.get(c.departement as number) as string, commune: c.slug as string })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug, commune } = await params
  const f = await trouver(lang, slug, commune)
  return f ? { title: f.commune.nom, description: f.commune.resume } : {}
}

export default async function FicheCommune({ params }: Props) {
  const { lang, slug, commune: slugCommune } = await params
  const d = dico(lang).kolda
  const f = await trouver(lang, slug, slugCommune)
  if (!f) notFound()
  const { dep, commune: c } = f

  // La population, comme tout chiffre du site, s'affiche avec sa source
  const [source, annee] = (c.habitantsSource ?? '').split(/\s*\((\d{4})\)\s*$/)
  const chiffres = [
    ...(c.habitants != null
      ? [
          { valeur: formatNombre(c.habitants, lang), libelle: d.habitants, source: source || c.habitantsSource || '', annee: annee ?? '' },
          { valeur: formatPart(c.habitants / total(f.toutesDuDep), lang), libelle: d.partDepartement, source: source || '', annee: annee ?? '' },
        ]
      : []),
    ...(c.indicateurs ?? []),
  ]
  const reperes = [
    { titre: d.departement, texte: nomCourt(dep) },
    { titre: d.arrondissement, texte: c.arrondissement || d.chefLieu },
    ...(c.reperes ?? []),
  ]
  const voisines = c.arrondissement ? f.voisines.filter((v) => v.arrondissement === c.arrondissement) : f.voisines

  return (
    <>
      <EnTetePage
        surtitre={
          <Link href={lien(lang, `/decouvrir-kolda/${dep.slug}`)} className="lien-retour">
            ← {dep.nom}
          </Link>
        }
        titre={c.nom}
        intro={c.resume}
      />

      <section className="section">
        <div className="conteneur">
          {c.photo && typeof c.photo === 'object' && (
            <figure className="photo-site bandeau-photo">
              <Picture media={c.photo} taille="large" priority sizes="(max-width: 1240px) 100vw, 1200px" />
              {c.photo.credit && <figcaption className="photo-site__credit">{c.photo.credit}</figcaption>}
            </figure>
          )}
          <div className="fiche">
            <div data-reveal>
              {!!chiffres.length && <Indicateurs indicateurs={chiffres} lang={lang} />}
              <Paragraphes texte={c.presentation} />
            </div>
            <Reperes reperes={reperes} lang={lang} />
          </div>
        </div>
      </section>

      {!!voisines.length && (
        <section className="section section--sable">
          <div className="conteneur">
            <TitreSection titre={c.arrondissement ? d.autresCommunes : d.autresCommunesDepartement} />
            <ul className="communes__voisines">
              {voisines.map((v) => (
                <li key={v.id}>
                  <Link href={lien(lang, `/decouvrir-kolda/${dep.slug}/${v.slug}`)}>{v.nom}</Link>
                  {v.habitants != null && (
                    <span className="communes__habitants">
                      {formatNombre(v.habitants, lang)} {d.habitants}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="fiche__retour">
              <Link href={lien(lang, '/decouvrir-kolda/en-chiffres')} className="lien-fleche">
                {d.voirChiffres} <Icone nom="fleche" taille={18} />
              </Link>
            </p>
          </div>
        </section>
      )}

      <AppelAction titre={d.completerTitre} texte={d.completerTexte} href={lien(lang, '/contact?objet=information')} label={d.completerBouton} />
    </>
  )
}
