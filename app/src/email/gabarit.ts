/** Gabarit HTML des e-mails ADET (compatible clients mail : tableaux + styles en ligne). */
const echapper = (t: string) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export const gabaritEmail = ({ titre, intro, lignes = [], bouton }: {
  titre: string
  intro: string
  lignes?: [string, string][]
  bouton?: { texte: string; url: string }
}) => `<!doctype html>
<html><body style="margin:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#142033">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0f2240;padding:24px 28px;color:#f9db5f;font-size:22px;font-weight:bold;letter-spacing:1px">ADET</td></tr>
<tr><td style="height:6px;background:linear-gradient(90deg,#244c8a,#f9db5f,#0b7a1e,#00586e,#ffae5d,#3c6ef1)"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:22px;color:#0f2240">${echapper(titre)}</h1>
<p style="margin:0 0 20px;line-height:1.6">${echapper(intro)}</p>
${lignes.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${lignes
  .map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;color:#4a5568;font-size:13px;vertical-align:top;white-space:nowrap">${echapper(k)}</td><td style="padding:8px 0;font-size:15px;white-space:pre-line">${echapper(v)}</td></tr>`)
  .join('')}</table>` : ''}
${bouton ? `<p style="margin:24px 0 0"><a href="${bouton.url}" style="display:inline-block;background:#f9db5f;color:#0f2240;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${echapper(bouton.texte)}</a></p>` : ''}
</td></tr>
<tr><td style="padding:18px 28px;background:#f7f4ec;color:#4a5568;font-size:12px">Association pour la promotion du Développement Économique Territorial · Kolda, Sénégal</td></tr>
</table></td></tr></table></body></html>`
