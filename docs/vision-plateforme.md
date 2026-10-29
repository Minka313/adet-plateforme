# Vision de la plateforme ADET – Kolda

## Pourquoi cette plateforme
Le cadre stratégique de l'ADET fait un constat clair : en Casamance, et à Kolda en particulier, les jeunes manquent surtout d'**accès à l'information pertinente**. Ils savent mal où trouver une formation professionnalisante, un accompagnement entrepreneurial ou un financement.

**Ligne directrice :** la plateforme est *le point d'entrée unique pour comprendre le territoire de Kolda et y saisir des opportunités*. L'ADET y apparaît comme l'acteur qui l'anime.

## Lien avec les axes stratégiques
| Axe ADET | Traduction dans la plateforme |
|---|---|
| 1. Renforcement de capacités | Espace **Se former** : catalogue, inscriptions, puis e-learning léger |
| 2. Partenariats stratégiques | Pages **Partenaires** et **Devenir partenaire**, annuaire des structures |
| 3. Ressources locales | Espace **Découvrir Kolda** : fiches territoire, filières, carte |
| 4. Innovation / Civic Tech | La plateforme elle-même : données ouvertes, PWA, cartographie |
| 5. Suivi & évaluation | Fiches projets avec indicateurs d'impact, tableau de bord |

## Publics cibles (personas)
- **Aminata, 24 ans, Vélingara** : diplômée et sans emploi. Elle cherche une formation et un financement pour lancer une activité de transformation agricole. Elle consulte sur un smartphone Android, avec une connexion 3G et des forfaits limités.
- **Moussa, 35 ans, porteur de projet à Kolda** : il veut connaître les filières porteuses, les structures d'accompagnement et les appels à projets.
- **Un partenaire technique ou financier (ONG, coopération, collectivité)** : il veut comprendre ce que fait l'ADET, ses résultats et son ancrage territorial avant de s'engager.
- **Un chercheur, un étudiant ou un journaliste** : il cherche des données fiables et sourcées sur la région.
- **Un membre de l'ADET (DCIT, secrétariat)** : il publie les actualités, les formations et les opportunités sans compétence technique.

## Arborescence
```
Accueil
├── Découvrir Kolda
│   ├── La région (histoire, culture, géographie)
│   ├── Départements : Kolda · Vélingara · Médina Yoro Foulah
│   │   └── Communes
│   ├── Économie & filières (agriculture, élevage, forêt, coton…)
│   ├── Carte interactive
│   └── Kolda en chiffres (tableau de bord)
├── Opportunités
│   ├── Financements
│   ├── Appels à projets
│   ├── Emplois & stages
│   └── Structures d'accompagnement (annuaire)
├── Se former
│   ├── Catalogue des formations
│   ├── Prochaines sessions + inscription
│   └── (V2) Apprendre en ligne
├── L'ADET
│   ├── Qui sommes-nous (vision, mission, valeurs)
│   ├── Équipe & départements
│   ├── Nos réalisations
│   ├── Actualités
│   ├── Partenaires
│   └── Documents & rapports
└── Agir
    ├── Contact
    ├── Devenir partenaire
    ├── Adhérer / Bénévolat
    └── Newsletter / WhatsApp
```

## Principes de conception
1. **Mobile d'abord et sobriété** : pages légères, images compressées, rendu statique et consultation hors ligne (PWA).
2. **Toujours sourcer** : chaque chiffre affiche sa source et son année.
3. **Publication autonome** : tout le contenu se modifie depuis le back-office `/admin`, en français.
4. **Langage simple** : vulgariser plutôt que jargonner. Des audios en pulaar et en wolof sont envisagés plus tard.
5. **Opportunités à jour** : chaque opportunité porte une date d'expiration et disparaît automatiquement une fois échue.

## Modèle de données (collections Payload)
| Collection | Contenu principal |
|---|---|
| Territoires | région, département ou commune ; parent ; description ; géométrie ; photo |
| Indicateurs | libellé, valeur, unité, année, source, territoire |
| Ressources | filières et ressources naturelles ou culturelles, par territoire |
| Projets | réalisations : axe, territoire, dates, partenaires, impact chiffré, galerie |
| Actualites | articles, catégorie, date |
| Opportunites | type, description, cible, échéance, lien, structure |
| Structures | annuaire des acteurs d'accompagnement |
| Formations / Sessions / Inscriptions | catalogue, dates et lieux, participants |
| Partenaires, Equipe, Documents, Medias, Utilisateurs | — |
| (V2) Modules, Lecons, Quiz, Progressions | e-learning |

Rôles : `admin`, `editeur`, `formateur` et, en V2, `apprenant`.

## Feuille de route
- **Phase 0 (terminée)** : dossier, cadrage et socle Next.js + Payload + Postgres.
- **Phase 1 (vitrine ADET, en cours)** : pages ADET, réalisations, actualités, équipe, partenaires, contact et back-office. Priorité demandée par le directeur : mettre l'association en avant.
- **Phase 2 (Kolda, en cours)** : « Découvrir Kolda » en ligne (région, 3 départements, 5 filières, chiffres sourcés RGPH-5, carte cliquable). « Opportunités » ouverte (annuaire de 8 structures vérifiées, offres avec date limite). Restent : communes, « Kolda en chiffres » détaillé.
- **Phase 3 (Formations V1, en cours)** : catalogue des formations de l'ADET, sessions datées avec nombre de places, inscriptions en ligne (statuts, places libérées à l'annulation, alertes e-mail, export CSV), organismes de formation référencés. Restent : rôle `formateur`, e-mail de confirmation quand l'équipe valide une place.
- **Phase 4** : e-learning léger, PWA hors ligne, langues locales, suivi-évaluation.
