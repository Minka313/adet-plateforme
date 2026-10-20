import type { CollectionAfterChangeHook } from 'payload'

import { gabaritEmail } from '../email/gabarit'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const OBJETS: Record<string, string> = {
  information: "Demande d'information",
  partenariat: 'Partenariat',
  adhesion: 'Adhésion / bénévolat',
  formation: 'Formations',
  autre: 'Autre',
}

/**
 * Nouveau message du formulaire de contact :
 * 1. alerte l'équipe ADET (NOTIFICATION_EMAIL, sinon l'e-mail des coordonnées) ;
 * 2. envoie un accusé de réception à l'expéditeur, dans sa langue.
 * Un échec d'envoi n'empêche jamais l'enregistrement du message.
 */
export const notifierMessage: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const { payload } = req
  try {
    const co = await payload.findGlobal({ slug: 'coordonnees', req })
    const destinataire = process.env.NOTIFICATION_EMAIL || co.email
    if (destinataire) {
      await payload.sendEmail({
        to: destinataire,
        replyTo: doc.email || undefined,
        subject: `[Site ADET] ${OBJETS[doc.objet] ?? 'Message'} – ${doc.nom}`,
        html: gabaritEmail({
          titre: 'Nouveau message reçu sur le site',
          intro: 'Un visiteur a écrit via le formulaire de contact. Répondez directement à cet e-mail pour lui écrire.',
          lignes: [
            ['Nom', doc.nom],
            ['Organisation', doc.organisation || '—'],
            ['E-mail', doc.email || '—'],
            ['Téléphone', doc.telephone || '—'],
            ['Objet', OBJETS[doc.objet] ?? '—'],
            ['Message', doc.message],
          ],
          bouton: { texte: 'Ouvrir dans le back-office', url: `${SITE}/admin/collections/messages/${doc.id}` },
        }),
      })
    }
    if (doc.email) {
      const en = doc.langue === 'en'
      await payload.sendEmail({
        to: doc.email,
        subject: en ? 'ADET – We have received your message' : 'ADET – Nous avons bien reçu votre message',
        html: gabaritEmail({
          titre: en ? `Thank you, ${doc.nom}` : `Merci, ${doc.nom}`,
          intro: en
            ? 'Your message has been received by the ADET team. We will get back to you as soon as possible.'
            : "Votre message a bien été reçu par l'équipe de l'ADET. Nous vous répondrons dans les meilleurs délais.",
          lignes: [[en ? 'Your message' : 'Votre message', doc.message]],
          bouton: { texte: en ? 'Visit our website' : 'Visiter notre site', url: `${SITE}/${en ? 'en' : 'fr'}` },
        }),
      })
    }
  } catch (e) {
    payload.logger.error({ err: e }, 'Envoi des e-mails du formulaire de contact impossible')
  }
  return doc
}
