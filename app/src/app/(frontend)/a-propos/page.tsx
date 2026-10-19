import type { Metadata } from 'next'
import Link from 'next/link'

import { EnTetePage } from '@/components/Blocs'
import { getAssociation } from '@/lib/payload'

export const revalidate = 60
export const metadata: Metadata = { title: "L'association" }

export default async function APropos() {
  const asso = await getAssociation()
  return (
    <>
      <EnTetePage surtitre="Qui sommes-nous ?" titre={asso.nom} intro={asso.introduction} />

      <section className="section">
        <div className="conteneur deux-colonnes">
          <div className="encart encart--bleu">
            <h2>Vision</h2>
            <p>{asso.vision}</p>
          </div>
          <div className="encart encart--vert">
            <h2>Mission</h2>
            <p>{asso.mission}</p>
          </div>
        </div>
      </section>

      {!!asso.valeurs?.length && (
        <section className="section section--teinte">
          <div className="conteneur">
            <h2>Nos valeurs</h2>
            <ul className="valeurs">
              {asso.valeurs.map((v) => (
                <li key={v.id}>
                  <h3>{v.titre}</h3>
                  {v.description && <p>{v.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!!asso.axes?.length && (
        <section className="section" id="axes">
          <div className="conteneur">
            <h2>Nos axes stratégiques</h2>
            <ol className="axes axes--detail">
              {asso.axes.map((axe, i) => (
                <li key={axe.id} className="axe">
                  <span className="axe__num">{i + 1}</span>
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
          </div>
        </section>
      )}

      {!!asso.demarche?.length && (
        <section className="section section--teinte">
          <div className="conteneur">
            <h2>Notre démarche</h2>
            <ol className="etapes">
              {asso.demarche.map((e) => (
                <li key={e.id}>
                  <h3>{e.titre}</h3>
                  {e.description && <p>{e.description}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {asso.zoneTexte && (
        <section className="section">
          <div className="conteneur zone">
            <div>
              <h2>{asso.zoneTitre}</h2>
              <p>{asso.zoneTexte}</p>
            </div>
            {!!asso.regions?.length && (
              <div className="zone__regions">
                <p className="surtitre">Régions prioritaires</p>
                <ul>
                  {asso.regions.map((r) => (
                    <li key={r.id}>{r.nom}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="appel">
        <div className="conteneur appel__contenu">
          <div>
            <h2>Une équipe pluridisciplinaire</h2>
            <p>Six pôles travaillent ensemble pour porter la vision de l&apos;ADET.</p>
          </div>
          <Link href="/equipe" className="bouton bouton--jaune">
            Découvrir l&apos;équipe
          </Link>
        </div>
      </section>
    </>
  )
}
