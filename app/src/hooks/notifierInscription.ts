import type { CollectionAfterChangeHook } from 'payload'

import { gabaritEmail } from '../email/gabarit'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Nouvelle inscription à une session de formation :
 * 1. alerte l'équipe ADET (NOTIFICATION_EMAIL, sinon l'e-mail des coordonnées) ;
 * 2. si la personne a donné un e-mail, lui confirme la réception de sa demande, dans sa langue.
 * Un échec d'envoi n'empêche jamais l'enregistrement de l'inscription.
 */
export const notifierInscription: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const { payload } = req
  const en = doc.langue === 'en'
  try {
    const sessionId = typeof doc.session === 'object' ? doc.session.id : doc.session
    const session = await payload.findByID({ collection: 'sessions', id: sessionId, depth: 1, locale: en ? 'en' : 'fr', fallbackLocale: 'fr', req })
    const formation = typeof session.formation === 'object' ? session.formation.titre : ''
    const quand = new Intl.DateTimeFormat(en ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(session.dateDebut),
    )

    const co = await payload.findGlobal({ slug: 'coordonnees', req })
    const destinataire = process.env.NOTIFICATION_EMAIL || co.email
    if (destinataire) {
      await payload.sendEmail({
        to: destinataire,
        replyTo: doc.email || undefined,
        subject: `[Site ADET] Inscription – ${formation} (${quand}) – ${doc.nom}`,
        html: gabaritEmail({
          titre: 'Nouvelle demande d’inscription',
          intro: 'Une personne souhaite participer à une formation. Contactez-la pour confirmer, puis changez le statut de son inscription.',
          lignes: [
            ['Formation', formation],
            ['Session', `${quand}${session.lieu ? ` · ${session.lieu}` : ''}`],
            ['Nom', doc.nom],
            ['Téléphone', doc.telephone],
            ['E-mail', doc.email || '—'],
            ['Commune', doc.commune || '—'],
            ['Activité ou projet', doc.motivation || '—'],
          ],
          bouton: { texte: 'Ouvrir dans le back-office', url: `${SITE}/admin/collections/inscriptions/${doc.id}` },
        }),
      })
    }
    if (doc.email) {
      await payload.sendEmail({
        to: doc.email,
        subject: en ? 'ADET – We have received your registration' : 'ADET – Nous avons bien reçu votre inscription',
        html: gabaritEmail({
          titre: en ? `Thank you, ${doc.nom}` : `Merci, ${doc.nom}`,
          intro: en
            ? 'Your registration request has been received. The ADET team will contact you to confirm your place.'
            : 'Votre demande d’inscription a bien été reçue. L’équipe de l’ADET vous contactera pour confirmer votre place.',
          lignes: [
            [en ? 'Training' : 'Formation', formation],
            ['Date', quand],
            ...(session.lieu ? [[en ? 'Location' : 'Lieu', session.lieu] as [string, string]] : []),
          ],
          bouton: { texte: en ? 'See all training courses' : 'Voir toutes les formations', url: `${SITE}/${en ? 'en' : 'fr'}/se-former` },
        }),
      })
    }
  } catch (e) {
    payload.logger.error({ err: e }, 'Envoi des e-mails d’inscription impossible')
  }
  return doc
}
