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
