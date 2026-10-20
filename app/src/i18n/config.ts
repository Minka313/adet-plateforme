export const LANGUES = ['fr', 'en'] as const
export type Langue = (typeof LANGUES)[number]
export const LANGUE_DEFAUT: Langue = 'fr'

export const estLangue = (v: unknown): v is Langue => typeof v === 'string' && (LANGUES as readonly string[]).includes(v)

/** Préfixe un chemin interne avec la langue : lien('en', '/a-propos') → '/en/a-propos' */
export const lien = (lang: Langue, chemin = '/'): string => `/${lang}${chemin === '/' ? '' : chemin}`

export const LOCALE_INTL: Record<Langue, string> = { fr: 'fr-FR', en: 'en-GB' }
