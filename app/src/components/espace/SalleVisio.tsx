'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type ApiJitsi = {
  executeCommand: (commande: string, ...args: unknown[]) => void
  addListener: (evt: string, f: () => void) => void
  isVideoMuted: () => Promise<boolean>
  dispose: () => void
}
type Constructeur = new (domaine: string, options: Record<string, unknown>) => ApiJitsi

/**
 * Salle de visio Jitsi intégrée à l'espace pro. Micro coupé à l'entrée ; « Économie de données »
 * coupe la vidéo et réduit la qualité reçue, pour la 3G et les forfaits limités.
 */
export function SalleVisio({ domaine, script, salle, jeton, nom, email, retour }: { domaine: string; script: string; salle: string; jeton?: string | null; nom: string; email: string; retour: string }) {
  const conteneur = useRef<HTMLDivElement>(null)
  const api = useRef<ApiJitsi | null>(null)
  const router = useRouter()
  const [etat, setEtat] = useState<'chargement' | 'pret' | 'erreur'>('chargement')
  const [economie, setEconomie] = useState(false)

  useEffect(() => {
    let annule = false
    const demarrer = () => {
      const Jitsi = (window as unknown as { JitsiMeetExternalAPI?: Constructeur }).JitsiMeetExternalAPI
      if (!Jitsi || !conteneur.current || annule) return
      api.current = new Jitsi(domaine, {
        roomName: salle,
        jwt: jeton ?? undefined,
        parentNode: conteneur.current,
        width: '100%',
        height: '100%',
        lang: 'fr',
        userInfo: { displayName: nom, email },
        configOverwrite: {
          startWithAudioMuted: true,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
          resolution: 360,
          constraints: { video: { height: { ideal: 360, max: 360 } } },
        },
        interfaceConfigOverwrite: { MOBILE_APP_PROMO: false, SHOW_JITSI_WATERMARK: false },
      })
      api.current.addListener('readyToClose', () => router.push(retour))
      setEtat('pret')
    }
    const existant = document.querySelector<HTMLScriptElement>(`script[src="${script}"]`)
    if (existant && (window as unknown as { JitsiMeetExternalAPI?: unknown }).JitsiMeetExternalAPI) demarrer()
    else {
      const balise = existant ?? Object.assign(document.createElement('script'), { src: script, async: true })
      balise.addEventListener('load', demarrer)
      balise.addEventListener('error', () => !annule && setEtat('erreur'))
      if (!existant) document.body.appendChild(balise)
    }
    return () => {
      annule = true
      api.current?.dispose()
      api.current = null
    }
  }, [domaine, script, salle, jeton, nom, email, retour, router])

  function basculerEconomie() {
    const actif = !economie
    setEconomie(actif)
    // Qualité reçue minimale et caméra coupée ; au retour, qualité normale (la caméra reste à rallumer soi-même)
    api.current?.executeCommand('setVideoQuality', actif ? 180 : 360)
    if (actif) api.current?.isVideoMuted().then((coupee) => !coupee && api.current?.executeCommand('toggleVideo'))
  }

  return (
    <div className="visio">
      <div className="visio__barre">
        <p>{etat === 'erreur' ? 'La visio n’a pas pu se charger. Vérifiez votre connexion et rechargez la page.' : 'Micro coupé à l’entrée. Autorisez la caméra et le micro quand le navigateur le demande.'}</p>
        <button type="button" className={`bouton bouton--petit ${economie ? 'bouton--plein' : 'bouton--clair'}`} onClick={basculerEconomie} disabled={etat !== 'pret'} aria-pressed={economie}>
          Économie de données {economie ? 'activée' : ''}
        </button>
      </div>
      <div ref={conteneur} className="visio__cadre" />
    </div>
  )
}
