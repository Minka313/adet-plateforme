import { createHmac, createSign } from 'node:crypto'

/**
 * Visio de l'équipe (Jitsi). Avec les clés 8x8 JaaS (JAAS_APP_ID, JAAS_API_KEY_ID, JAAS_PRIVATE_KEY),
 * les salles sont privées et l'organisateur est modérateur d'office (jeton signé) ; sans elles,
 * repli sur le service public meet.jit.si, où le premier entrant doit se connecter pour ouvrir la salle.
 */
export type ConfigVisio = { fournisseur: 'jaas' | 'public'; domaine: string; script: string }

const JAAS = {
  appId: process.env.JAAS_APP_ID,
  cle: process.env.JAAS_API_KEY_ID,
  // La clé privée tient sur une ligne dans les variables d'environnement : « \n » y remplace les retours à la ligne
  privee: process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

export const jaasActif = () => Boolean(JAAS.appId && JAAS.cle && JAAS.privee)

export const configVisio = (): ConfigVisio =>
  jaasActif()
    ? { fournisseur: 'jaas', domaine: '8x8.vc', script: `https://8x8.vc/${JAAS.appId}/external_api.js` }
    : { fournisseur: 'public', domaine: 'meet.jit.si', script: 'https://meet.jit.si/external_api.js' }

/** Nom de salle impossible à deviner : la clé (« equipe », « reunion-12 ») suivie d'une empreinte secrète */
export function nomSalle(cle: string): string {
  const empreinte = createHmac('sha256', process.env.PAYLOAD_SECRET ?? 'adet').update(`visio:${cle}`).digest('hex').slice(0, 16)
  const nom = `adet-${cle}-${empreinte}`
  return jaasActif() ? `${JAAS.appId}/${nom}` : nom
}

const base64url = (texte: string | Buffer) => Buffer.from(texte).toString('base64url')

/** Jeton JaaS (RS256) valable 4 heures, pour une salle et une personne ; modérateur ou non */
export function jetonJaas({ salle, id, nom, email, moderateur }: { salle: string; id: number; nom: string; email: string; moderateur: boolean }): string | null {
  if (!jaasActif()) return null
  const maintenant = Math.floor(Date.now() / 1000)
  const entete = { alg: 'RS256', kid: JAAS.cle, typ: 'JWT' }
  const contenu = {
    aud: 'jitsi',
    iss: 'chat',
    sub: JAAS.appId,
    room: salle.split('/').pop(),
    nbf: maintenant - 10,
    exp: maintenant + 4 * 3600,
    context: {
      user: { id: String(id), name: nom, email, moderator: moderateur ? 'true' : 'false' },
      features: { livestreaming: 'false', recording: 'false', transcription: 'false', 'outbound-call': 'false' },
    },
  }
  const aSigner = `${base64url(JSON.stringify(entete))}.${base64url(JSON.stringify(contenu))}`
  const signature = createSign('RSA-SHA256').update(aSigner).sign(JAAS.privee!)
  return `${aSigner}.${base64url(signature)}`
}
