import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function Riche({ data }: { data?: SerializedEditorState | null }) {
  if (!data) return null
  return <RichText data={data} className="prose" />
}
