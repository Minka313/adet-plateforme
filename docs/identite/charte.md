# Identité visuelle ADET

## Fichiers du logo
| Fichier | Usage |
|---|---|
| `adet-logo-original.jpg` | Original reçu (JPG, fond blanc) |
| `adet-logo.png` | Logo complet **détouré** (fond transparent), à utiliser sur fond clair ou sombre |
| `adet-symbole.svg` | **Symbole seul** (silhouette et étoiles) **redessiné en vectoriel**, net à toutes les tailles |
| `adet-icone.svg` | Symbole centré dans un carré : icône d'application (192 et 512 px) |
| `adet-favicon.svg` | Symbole resserré, sans les petites étoiles, lisible à 16 et 32 px (onglet du navigateur) |
| `generer-symbole.py` | Script qui régénère `adet-symbole.svg` (les formes sont modifiables) |

Sur le site, ces fichiers sont dans `app/public/brand/` (adresse `/brand/...`). Le favicon et l'icône Apple sont dans `app/src/app/`.

Le texte « ADET » n'est pas vectorisé, car la police d'origine est inconnue : il reste en image dans `adet-logo.png`. Si l'ADET retrouve le fichier source ou le nom de la police, on pourra produire un logo complet en SVG.

## Couleurs (relevées sur le logo)
| Rôle | Couleur |
|---|---|
| Bleu ADET (texte du logo), couleur principale | `#244C8A` |
| Bleu vif (silhouette) | `#3C6EF1` |
| Vert (silhouette), rappel agriculture et territoire | `#007500` |
| Bleu pétrole (tête) | `#00586E` |
| Jaune étoiles, accent | `#F9DB5F` |
| Orange étoile, accent | `#FFAE5D` |

## À confirmer avec l'ADET
- Validation du symbole redessiné (le comparer à l'original)
- Nom de la police du texte « ADET » ou fichier source, s'il existe
- Codes couleurs officiels, s'ils existent
