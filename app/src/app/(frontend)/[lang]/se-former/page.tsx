import type { Metadata } from 'next'

import { PageBientot } from '@/components/Bientot'
import { dico, lien, type Langue } from '@/i18n'

type Props = { params: Promise<{ lang: Langue }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return { title: dico(lang).bientot.formations.titre }
}

export default async function SeFormer({ params }: Props) {
  const { lang } = await params
  return <PageBientot lang={lang} rubrique={dico(lang).bientot.formations} lienHref={lien(lang, '/contact?objet=formation')} />
}
