import type { Langue } from './config'
import { en } from './en'
import { fr } from './fr'

const DICTIONNAIRES = { fr, en }

export const dico = (lang: Langue) => DICTIONNAIRES[lang]

export * from './config'
