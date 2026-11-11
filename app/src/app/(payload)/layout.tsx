/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

// Polices de l'ADET (ajout manuel, à conserver si Payload régénère ce fichier)
const titres = Bricolage_Grotesque({ subsets: ['latin'], variable: '--adet-police-titres', display: 'swap', axes: ['opsz'] })
const texte = Public_Sans({ subsets: ['latin'], variable: '--adet-police-texte', display: 'swap' })

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} htmlProps={{ className: `${titres.variable} ${texte.variable}` }} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
