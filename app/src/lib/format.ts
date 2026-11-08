import { LOCALE_INTL, type Langue } from '@/i18n/config'

export const formatMois = (iso: string | null | undefined, lang: Langue): string =>
  iso ? new Intl.DateTimeFormat(LOCALE_INTL[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso)) : ''

export const formatDate = (iso: string | null | undefined, lang: Langue): string =>
  iso
    ? new Intl.DateTimeFormat(LOCALE_INTL[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso))
    : ''

export const periode = (debut: string | null | undefined, fin: string | null | undefined, lang: Langue): string => {
  if (debut && fin) {
    const d = formatMois(debut, lang)
    const f = formatMois(fin, lang)
    return d === f ? d : `${d} – ${f}`
  }
  return formatMois(debut || fin, lang)
}

export const telHref = (numero: string): string => {
  const chiffres = numero.replace(/\D/g, '')
  return `tel:+${chiffres.startsWith('221') ? chiffres : `221${chiffres}`}`
}

/** « 12 mars 2027 », « 12–14 mars 2027 » ou « 30 mars – 2 avril 2027 » */
export const datesSession = (debut: string, fin: string | null | undefined, lang: Langue): string => {
  const format = new Intl.DateTimeFormat(LOCALE_INTL[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  return fin ? format.formatRange(new Date(debut), new Date(fin)) : format.format(new Date(debut))
}

/** « 3 places restantes », « 1 place restante » */
export const placesRestantes = (n: number, t: { placesRestantes: string; placeRestante: string }): string =>
  n === 1 ? t.placeRestante : t.placesRestantes.replace('{n}', String(n))

/** « 914 797 » (fr) ou « 914,797 » (en) */
// L'espace fine insécable du français est presque invisible à l'écran : espace insécable normale
export const formatNombre = (n: number, lang: Langue): string => new Intl.NumberFormat(LOCALE_INTL[lang]).format(n).replace(/\u202f/g, '\u00a0')

/** Part en pourcentage, une décimale : « 35,4 % » (fr) ou « 35.4% » (en) */
export const formatPart = (part: number, lang: Langue): string =>
  new Intl.NumberFormat(LOCALE_INTL[lang], { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(part)
