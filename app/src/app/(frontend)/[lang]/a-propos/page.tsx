import type { Metadata } from 'next'

import { AppelAction, EnTetePage, TitreSection } from '@/components/Blocs'
import { CarteTerritoire } from '@/components/ui/Carte'
import { Icone } from '@/components/ui/Icone'
import { AXE_PAR_INDEX } from '@/fields/axe'
import { dico, lien, type Langue } from '@/i18n'
import { getAssociation } from '@/lib/payload'

export const revalidate = 60

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).nav.association, alternates: { languages: { fr: '/fr/a-propos', en: '/en/a-propos' } } }
}

export default async function APropos({ params }: Props) {
  const { lang } = await params
  const d = dico(lang)
  const asso = await getAssociation(lang)

  const chapitres = [
    { id: 'vision', titre: d.apropos.visionMission },
    { id: 'valeurs', titre: d.apropos.valeurs, si: !!asso.valeurs?.length },
    { id: 'axes', titre: d.apropos.axes, si: !!asso.axes?.length },
    { id: 'demarche', titre: d.apropos.demarche, si: !!asso.demarche?.length },
    { id: 'zone', titre: d.apropos.zone, si: !!asso.zoneTexte },
  ].filter((c) => c.si !== false)

  return (
    <>
      <EnTetePage surtitre={d.apropos.surtitre} titre={asso.nom} intro={asso.introduction} />

      <section className="section">
        <div className="conteneur chapitres">
          <nav className="sommaire" aria-label={d.apropos.sommaire}>
            <p>{d.apropos.sommaire}</p>
            <ol>
              {chapitres.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.id}`}>{c.titre}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div>
            <section className="chapitre" id="vision">
              <TitreSection surtitre="01" titre={d.apropos.visionMission} />
              <div className="vision-mission">
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

            {!!asso.valeurs?.length && (
              <section className="chapitre" id="valeurs">
                <TitreSection surtitre="02" titre={d.apropos.valeurs} intro={d.apropos.valeursIntro} />
                <ul className="valeurs" data-reveal>
                  {asso.valeurs.map((v) => (
                    <li key={v.id}>
                      <h3>{v.titre}</h3>
                      {v.description && <p>{v.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!asso.axes?.length && (
              <section className="chapitre" id="axes">
                <TitreSection surtitre="03" titre={d.apropos.axes} />
                <ol className="axes axes--detail">
                  {asso.axes.map((axe, i) => (
                    <li key={axe.id} className={`axe axe--${AXE_PAR_INDEX[i] ?? 'capacites'}`} data-reveal style={{ ['--i' as string]: i % 2 }}>
                      <div className="axe__tete">
                        <span className="axe__icone">
                          <Icone nom={AXE_PAR_INDEX[i] ?? 'capacites'} taille={28} />
                        </span>
                        <span className="axe__num">0{i + 1}</span>
                      </div>
                      <h3>{axe.titre}</h3>
                      {!!axe.objectifs?.length && (
                        <ul>
                          {axe.objectifs.map((o) => (
                            <li key={o.id}>{o.texte}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {!!asso.demarche?.length && (
              <section className="chapitre" id="demarche">
                <TitreSection surtitre="04" titre={d.apropos.demarche} intro={d.apropos.demarcheIntro} />
                <ol className="frise">
                  {asso.demarche.map((e, i) => (
                    <li key={e.id} data-reveal style={{ ['--i' as string]: i }}>
                      <h3>{e.titre}</h3>
                      {e.description && <p>{e.description}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {asso.zoneTexte && (
              <section className="chapitre" id="zone">
                <TitreSection surtitre="05" titre={asso.zoneTitre || d.apropos.zone} />
                <div className="prose" data-reveal>
                  <p>{asso.zoneTexte}</p>
                </div>
                <div data-reveal style={{ marginTop: '2rem' }}>
                  <CarteTerritoire titre={d.apropos.zone} />
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      <AppelAction titre={d.apropos.equipeTitre} texte={d.apropos.equipeTexte} href={lien(lang, '/equipe')} label={d.apropos.equipeBouton} />
    </>
  )
}
