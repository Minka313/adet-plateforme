'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { IconeEspace } from './Icones'

type InviteInstallation = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

// L'invitation d'installation arrive une seule fois, tôt : on la garde pour le bouton du profil
let invite: InviteInstallation | null = null
const abonnes = new Set<() => void>()
const prevenir = () => abonnes.forEach((f) => f())

const CLE_PUBLIQUE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

/** Clé VAPID (base64 url) → octets attendus par pushManager.subscribe */
const versOctets = (base64: string) => {
  const brut = atob((base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(brut, (c) => c.charCodeAt(0))
}

/** Monté dans le cadre de l'espace : enregistre le service worker et retient l'invitation d'installation */
export function EnregistrementAppli() {
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/espace-sw.js', { scope: '/espace' }).catch(() => null)
    const garder = (e: Event) => {
      e.preventDefault()
      invite = e as InviteInstallation
      prevenir()
    }
    const installee = () => {
      invite = null
      prevenir()
    }
    window.addEventListener('beforeinstallprompt', garder)
    window.addEventListener('appinstalled', installee)
    return () => {
      window.removeEventListener('beforeinstallprompt', garder)
      window.removeEventListener('appinstalled', installee)
    }
  }, [])
  return null
}

const suivreInvite = (f: () => void) => {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

type EtatNotifs = 'chargement' | 'impossible' | 'bloquees' | 'inactives' | 'actives' | 'non-configure'
type Possibilite = 'non-configure' | 'impossible' | 'bloquees' | 'possible'

const rien = () => () => {}
const estAutonome = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
const estIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent)
const possibilite = (): Possibilite => {
  if (!CLE_PUBLIQUE) return 'non-configure'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'impossible'
  return Notification.permission === 'denied' ? 'bloquees' : 'possible'
}

/** Profil : installer l'application sur l'écran d'accueil et recevoir les notifications sur cet appareil */
export function ReglagesAppareil() {
  const installable = useSyncExternalStore(suivreInvite, () => Boolean(invite), () => false)
  // Ce que le navigateur sait tout de suite (rien côté serveur)
  const autonome = useSyncExternalStore(rien, estAutonome, () => false)
  const ios = useSyncExternalStore(rien, estIos, () => false)
  const possible = useSyncExternalStore(rien, possibilite, () => 'possible' as Possibilite)
  const [abonne, setAbonne] = useState<boolean | null>(null)
  const [refuse, setRefuse] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Seule la recherche d'un abonnement existant est asynchrone
  useEffect(() => {
    if (possible !== 'possible') return
    navigator.serviceWorker.ready
      .then((r) => r.pushManager.getSubscription())
      .then((s) => setAbonne(Boolean(s)))
      .catch(() => setAbonne(false))
  }, [possible])

  const notifs: EtatNotifs = refuse ? 'bloquees' : possible !== 'possible' ? possible : abonne === null ? 'chargement' : abonne ? 'actives' : 'inactives'

  async function installer() {
    if (!invite) return
    await invite.prompt()
    await invite.userChoice
    invite = null
    prevenir()
  }

  async function activer() {
    setMessage(null)
    try {
      if ((await Notification.requestPermission()) !== 'granted') return setRefuse(true)
      const enregistrement = await navigator.serviceWorker.ready
      const abonnement =
        (await enregistrement.pushManager.getSubscription()) ??
        (await enregistrement.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: versOctets(CLE_PUBLIQUE!) }))
      const r = await fetch('/espace/notifications/abonnement', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abonnement.toJSON()),
      })
      if (!r.ok) throw new Error('enregistrement refusé')
      setAbonne(true)
      setMessage('Notifications activées sur cet appareil.')
    } catch {
      setMessage('L’activation a échoué. Réessayez, ou vérifiez que les notifications sont autorisées pour ce site.')
    }
  }

  async function desactiver() {
    setMessage(null)
    const abonnement = await (await navigator.serviceWorker.ready).pushManager.getSubscription()
    if (abonnement) {
      await fetch('/espace/notifications/abonnement', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: abonnement.endpoint }),
      }).catch(() => null)
      await abonnement.unsubscribe()
    }
    setAbonne(false)
    setMessage('Notifications désactivées sur cet appareil.')
  }

  return (
    <section className="bloc formulaire-espace">
      <h2>Cet appareil</h2>

      <div className="reglage">
        <span className="reglage__icone" aria-hidden="true">
          <IconeEspace nom="installer" />
        </span>
        <div className="reglage__texte">
          <p className="reglage__titre">Application sur l’écran d’accueil</p>
          {autonome ? (
            <p>L’espace pro est installé et s’ouvre comme une application.</p>
          ) : installable ? (
            <p>Ouvrez l’espace pro d’un geste, sans passer par le navigateur.</p>
          ) : ios ? (
            <p>Sur iPhone : touchez le bouton Partager de Safari, puis « Sur l’écran d’accueil ».</p>
          ) : (
            <p>Dans le menu du navigateur, choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».</p>
          )}
        </div>
        {installable && !autonome && (
          <button type="button" className="bouton bouton--plein" onClick={installer}>
            Installer
          </button>
        )}
      </div>

      <div className="reglage">
        <span className="reglage__icone" aria-hidden="true">
          <IconeEspace nom="cloche" />
        </span>
        <div className="reglage__texte">
          <p className="reglage__titre">Notifications sur cet appareil</p>
          <p>
            {
              {
                chargement: 'Vérification…',
                'non-configure': 'Bientôt disponibles : elles seront activées par l’administrateur du site.',
                impossible: ios && !autonome ? 'Sur iPhone, installez d’abord l’application sur l’écran d’accueil, puis revenez ici.' : 'Ce navigateur ne permet pas les notifications.',
                bloquees: 'Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur.',
                inactives: 'Soyez prévenu des annonces et de ce qui vous concerne, même application fermée.',
                actives: 'Activées : vous êtes prévenu même quand l’application est fermée.',
              }[notifs]
            }
          </p>
        </div>
        {notifs === 'inactives' && (
          <button type="button" className="bouton bouton--plein" onClick={activer}>
            Activer
          </button>
        )}
        {notifs === 'actives' && (
          <button type="button" className="bouton bouton--clair" onClick={desactiver}>
            Désactiver
          </button>
        )}
      </div>

      {message && (
        <p className="alerte alerte--ok" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
