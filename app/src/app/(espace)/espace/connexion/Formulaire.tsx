'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** Connexion par l'API Payload : le serveur pose lui-même le cookie de session (HttpOnly) */
export function FormulaireConnexion() {
  const router = useRouter()
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setEnCours(true)
    setErreur(null)
    try {
      const reponse = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(form.get('email')).trim().toLowerCase(), password: form.get('password') }),
      })
      if (reponse.ok) {
        router.replace('/espace')
        router.refresh()
        return
      }
      const corps = (await reponse.json().catch(() => null)) as { errors?: { message?: string }[] } | null
      const message = corps?.errors?.[0]?.message ?? ''
      if (reponse.status === 403 && message) setErreur(message)
      else if (/locked|verrouill/i.test(message)) setErreur('Trop d’essais : ce compte est bloqué 15 minutes. Réessayez plus tard.')
      else setErreur('E-mail ou mot de passe incorrect.')
    } catch {
      setErreur('Connexion impossible pour le moment. Vérifiez votre réseau et réessayez.')
    }
    setEnCours(false)
  }

  return (
    <form onSubmit={envoyer} className="connexion__form">
      <div className="champ">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required inputMode="email" />
      </div>
      <div className="champ">
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {erreur && (
        <p className="alerte alerte--erreur" role="alert">
          {erreur}
        </p>
      )}
      <button type="submit" className="bouton bouton--plein" disabled={enCours}>
        {enCours ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
