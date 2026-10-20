"""Génère src/data/carte.ts (chemins SVG) à partir des limites geoBoundaries (gbOpen, CC BY 4.0).

Usage : python3 scripts/generer-carte.py sen-ADM1.geojson sen-ADM2.geojson > src/data/carte.ts
"""
import json
import math
import sys


def dp(points, eps):
    """Simplification Douglas-Peucker."""
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-12
    imax, dmax = 0, 0.0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            imax, dmax = i, d
    if dmax > eps:
        return dp(points[: imax + 1], eps)[:-1] + dp(points[imax:], eps)
    return [points[0], points[-1]]


def rings(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates'][0]]
    return [p[0] for p in geom['coordinates']]


def make_projection(features, width):
    xs, ys = [], []
    for f in features:
        for r in rings(f['geometry']):
            for x, y in r:
                xs.append(x)
                ys.append(y)
    lat0 = math.radians((min(ys) + max(ys)) / 2)
    k = math.cos(lat0)
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    scale = width / ((maxx - minx) * k)
    height = (maxy - miny) * scale

    def proj(x, y):
        return ((x - minx) * k * scale, (maxy - y) * scale)

    return proj, width, height


def path(geom, proj, eps):
    out = []
    for r in rings(geom):
        raw = [proj(x, y) for x, y in r]
        # Anneau fermé : on le coupe en deux pour que Douglas-Peucker ait un segment de référence
        mid = len(raw) // 2
        pts = dp(raw[: mid + 1], eps)[:-1] + dp(raw[mid:], eps)
        if len(pts) < 4:
            continue
        out.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z')
    return ''.join(out)


def centroid(geom, proj):
    best = max(rings(geom), key=len)
    pts = [proj(x, y) for x, y in best]
    a = cx = cy = 0.0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        c = x1 * y2 - x2 * y1
        a += c
        cx += (x1 + x2) * c
        cy += (y1 + y2) * c
    a *= 0.5
    return (round(cx / (6 * a), 1), round(cy / (6 * a), 1))


adm1 = json.load(open(sys.argv[1]))['features']
adm2 = json.load(open(sys.argv[2]))['features']
CASAMANCE = {'Ziguinchor', 'Sedhiou', 'Kolda'}
KOLDA_DEPTS = {'Kolda': 'Kolda', 'Velingara': 'Vélingara', 'Medina Yoroufoula': 'Médina Yoro Foulah'}
REGION_DEPTS = {
    'Ziguinchor': {'Ziguinchor', 'Bignona', 'Oussouye'},
    'Sedhiou': {'Sedhiou', 'Bounkiling', 'Goudomp'},
    'Kolda': set(KOLDA_DEPTS),
}
NOMS = {'Sedhiou': 'Sédhiou', 'Kedougou': 'Kédougou', 'Thies': 'Thiès', 'Saint Louis': 'Saint-Louis'}

# Vue 1 : Sénégal entier (repère)
proj, w, h = make_projection(adm1, 600)
senegal = [
    {'nom': NOMS.get(f['properties']['shapeName'], f['properties']['shapeName']),
     'casamance': f['properties']['shapeName'] in CASAMANCE,
     'd': path(f['geometry'], proj, 0.8)}
    for f in adm1
]
vue_senegal = {'largeur': round(w), 'hauteur': round(h), 'regions': senegal}

# Vue 2 : zoom Casamance par départements
cas = [f for f in adm2 if any(f['properties']['shapeName'] in s for s in REGION_DEPTS.values())]
proj2, w2, h2 = make_projection(cas, 1000)
depts = []
for f in cas:
    n = f['properties']['shapeName']
    region = next(r for r, s in REGION_DEPTS.items() if n in s)
    depts.append({
        'nom': KOLDA_DEPTS.get(n, NOMS.get(n, n)),
        'region': NOMS.get(region, region),
        'kolda': region == 'Kolda',
        'd': path(f['geometry'], proj2, 0.6),
        'centre': centroid(f['geometry'], proj2),
    })
# Chefs-lieux (coordonnées approximatives, WGS84)
VILLES = [
    ('Ziguinchor', -16.2719, 12.5681, True),
    ('Sédhiou', -15.5569, 12.7081, True),
    ('Kolda', -14.9412, 12.8983, True),
    ('Vélingara', -14.1131, 13.1472, False),
]
villes = [{'nom': n, 'x': round(proj2(lon, lat)[0], 1), 'y': round(proj2(lon, lat)[1], 1), 'capitale': c} for n, lon, lat, c in VILLES]
vue_casamance = {'largeur': round(w2), 'hauteur': round(h2), 'departements': depts, 'villes': villes}

print('// Fichier généré par scripts/generer-carte.py — ne pas modifier à la main.')
print('// Source : geoBoundaries (gbOpen), Runfola et al. 2020, licence CC BY 4.0.')
print('/* eslint-disable */')
print('export const VUE_SENEGAL = ' + json.dumps(vue_senegal, ensure_ascii=False) + ' as const')
print('export const VUE_CASAMANCE = ' + json.dumps(vue_casamance, ensure_ascii=False) + ' as const')
