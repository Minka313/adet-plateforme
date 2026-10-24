/**
 * Signalement minimal des erreurs serveur à Sentry, sans SDK (aucune dépendance, aucun poids ajouté
 * aux pages) : un « envelope » envoyé à l'API d'ingestion. Actif seulement si SENTRY_DSN est défini.
 * Données personnelles : seul le chemin de la page est transmis (ni en-têtes, ni cookies, ni IP).
 */
type Contexte = Record<string, string | undefined>

type Frame = { function?: string; filename?: string; lineno?: number; colno?: number; in_app?: boolean }

const analyserDsn = (dsn: string) => {
  const { protocol, username, host, pathname } = new URL(dsn)
  const projet = pathname.replace(/^\//, '')
  return { cle: username, url: `${protocol}//${host}/api/${projet}/envelope/` }
}

/** Pile d'appels Node (« at fn (fichier:ligne:colonne) ») → frames Sentry, la plus ancienne en premier */
const frames = (pile?: string): Frame[] =>
  (pile ?? '')
    .split('\n')
    .slice(1)
    .map((ligne) => ligne.trim().match(/^at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map(([, fn, fichier, ligne, colonne]) => ({
      function: fn || '?',
      filename: fichier,
      lineno: Number(ligne),
      colno: Number(colonne),
      in_app: !fichier.includes('node_modules') && !fichier.startsWith('node:'),
    }))
    .reverse()

export async function signalerErreur(erreur: unknown, contexte: Contexte = {}, chemin?: string) {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  try {
    const { cle, url } = analyserDsn(dsn)
    const e = erreur instanceof Error ? erreur : new Error(String(erreur))
    const digest = typeof erreur === 'object' && erreur && 'digest' in erreur ? String(erreur.digest) : undefined
    const id = crypto.randomUUID().replace(/-/g, '')
    const evenement = {
      event_id: id,
      timestamp: Date.now() / 1000,
      platform: 'node',
      level: 'error',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
      release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
      exception: { values: [{ type: e.name, value: e.message, stacktrace: { frames: frames(e.stack) } }] },
      tags: { ...contexte, digest },
      ...(chemin && { request: { url: chemin.split('?')[0] } }),
    }
    const corps = [
      JSON.stringify({ event_id: id, sent_at: new Date().toISOString(), dsn }),
      JSON.stringify({ type: 'event' }),
      JSON.stringify(evenement),
    ].join('\n')
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${cle}, sentry_client=adet-plateforme/1.0`,
      },
      body: corps,
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Le signalement ne doit jamais faire échouer la requête de l'utilisateur
  }
}
