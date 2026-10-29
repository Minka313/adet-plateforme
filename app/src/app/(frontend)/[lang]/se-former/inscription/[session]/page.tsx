import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EnTetePage } from '@/components/Blocs'
import { EncadreVide } from '@/components/Opportunites'
import { Motif } from '@/components/ui/Motif'
import { dico, lien, type Langue } from '@/i18n'
import { datesSession, placesRestantes } from '@/lib/format'
import { getSessionAVenir } from '@/lib/payload'

import { FormulaireInscription } from './Formulaire'

// Les places restantes changent à chaque inscription : page toujours à jour
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ lang: Langue; session: string }> }

const lire = async ({ params }: Props) => {
  const { lang, session } = await params
  const id = Number(session)
  return { lang, s: Number.isInteger(id) && id > 0 ? await getSessionAVenir(id, lang) : null }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, s } = await lire(props)
  // Formulaire personnel : inutile dans les moteurs de recherche
  return s ? { title: `${dico(lang).inscription.titre} : ${s.formation.titre}`, robots: { index: false } } : {}
}

export default async function Inscription(props: Props) {
  const { lang, s } = await lire(props)
  if (!s) notFound()
  const d = dico(lang)
  const t = d.inscription
  const f = s.formation
  const quand = datesSession(s.dateDebut, s.dateFin, lang)
  const infos = [
    [t.session, `${quand}${s.lieu ? ` · ${s.lieu}` : ''}`],
    [d.formations.public, f.publicCible],
    [d.formations.duree, f.duree],
    [d.formations.cout, f.cout],
    [t.places, s.restantes !== null && s.etat === 'ouverte' ? placesRestantes(s.restantes, d.formations) : null],
  ].filter(([, v]) => v)

  return (
    <>
      <EnTetePage
        surtitre={
          <Link href={lien(lang, '/se-former')} className="lien-retour">
            ← {t.retour}
          </Link>
        }
        titre={f.titre}
        intro={f.resume}
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="conteneur contact">
          {s.etat === 'ouverte' ? (
            <FormulaireInscription lang={lang} session={s.id} t={t} />
          ) : (
            <EncadreVide titre={s.etat === 'complete' ? t.complet : t.fermee} texte={quand}>
              <Link href={lien(lang, '/se-former')} className="bouton bouton--or">
                {t.autreSession}
              </Link>
            </EncadreVide>
          )}
          <aside className="contact__infos" data-reveal>
            <Motif couleur="#fff" opacite={0.04} taille={48} />
            <h2>{t.titre}</h2>
            <dl className="formation__infos formation__infos--sombre">
              {infos.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </>
  )
}
