const moisAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const jourMoisAnnee = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export const formatMois = (iso?: string | null): string => (iso ? moisAnnee.format(new Date(iso)) : '')
export const formatDate = (iso?: string | null): string => (iso ? jourMoisAnnee.format(new Date(iso)) : '')

export const periode = (debut?: string | null, fin?: string | null): string => {
  if (debut && fin) {
    const d = formatMois(debut)
    const f = formatMois(fin)
    return d === f ? d : `${d} – ${f}`
  }
  return formatMois(debut || fin)
}

export const telHref = (numero: string): string => {
  const chiffres = numero.replace(/\D/g, '')
  return `tel:+${chiffres.startsWith('221') ? chiffres : `221${chiffres}`}`
}
