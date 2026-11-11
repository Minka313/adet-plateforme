# Chantier V2 : de la vitrine à l'outil de travail de l'ADET

Ouvert le 11 novembre 2026. Ce document fixe l'ordre des travaux, les choix techniques et ce que chaque étape attend de l'ADET. Il est mis à jour à la fin de chaque lot.

## L'idée directrice

Aujourd'hui, la plateforme montre l'ADET au public. La V2 en fait aussi **l'endroit où l'équipe travaille** : on s'y connecte, on y voit ses tâches, ses réunions et ses rapports, on y est prévenu de ce qui demande une action, on s'y réunit en visio, le tout depuis un téléphone, comme une application.

Deux principes ne changent pas :
- **Sobriété** : les membres travaillent sur Android, en 3G/4G, avec des forfaits limités. Chaque écran doit rester léger.
- **Un seul outil** : pas de nouvel abonnement par fonction. Tout passe par la plateforme et ses comptes.

## Les huit demandes et leur réponse

| # | Demande | Réponse retenue |
|---|---|---|
| 1 | Un design plus beau | Refonte visuelle en deux temps : trois directions proposées sur maquette, puis application à tout le site |
| 2 | Coordonnées | 76 941 23 25 (appel et WhatsApp), 77 458 61 05, 77 163 26 72 ; e-mail inchangé (adetsenegal1@gmail.com) |
| 3 | Espace professionnel | `/espace` : tableau de bord personnel, tâches par pôle, réunions, rapports d'activité avec validation, documents internes, annuaire de l'équipe, annonces |
| 4 | Notifications | Cloche avec compteur dans l'espace et notifications sur le téléphone même navigateur fermé (Web Push) |
| 5 | Visio | Réunions et formations en visio intégrées (Jitsi), avec planification, invitations, rappels et mode « économie de données » |
| 6 | Connexion | Page « Se connecter » sur le site, comptes par personne avec rôles, mot de passe oublié par e-mail |
| 7 | Application | Site installable sur l'écran d'accueil (PWA), fonctionnement minimal hors connexion |
| 8 | Contenus et photos | Textes et photos de la page Facebook de l'ADET (facebook.com/Adet23) intégrés au site, en remplacement des illustrations |

## L'ordre des lots

L'ordre suit les dépendances : on ne peut pas notifier quelqu'un qui n'a pas de compte, ni envoyer une notification sur un téléphone sans l'application installable.

| Lot | Contenu | Dépend de |
|---|---|---|
| **A** | Coordonnées (2), collecte des contenus Facebook (8), choix de la direction visuelle (1) | Lien Facebook et photos |
| **B** | Refonte visuelle du site public (1) et intégration des photos (8) | Lot A |
| **C** | Connexion (6), rôles, et socle de l'espace pro : tableau de bord, annuaire, annonces (3). *Livré sans e-mail : l'administrateur crée les comptes et réinitialise les mots de passe* | — |
| **C bis** | Refonte du back-office `/admin` : thème aux couleurs de l'ADET, tableau de bord plus riche, navigation par grandes rubriques (demande du 11 novembre) | Lot C |
| **D** | Application installable (7) et notifications (4) | Lot C |
| **E** | Outils de travail de l'espace pro : tâches, réunions, rapports, documents (3) | Lot D |
| **F** | Visio pour les réunions et les formations (5) | Lot E (réunions) |

Chaque lot passe par une pull request, la CI, une vérification visuelle (ordinateur et mobile) et un point avec vous avant la mise en production.

## Choix techniques

- **Pas de nouvelle application à part** : l'espace pro est construit dans le même projet Next.js + Payload. Les comptes de l'espace sont les comptes Payload, avec de nouveaux rôles. Le back-office `/admin` reste réservé à la gestion des contenus du site.
- **Rôles** : `admin` (tout), `bureau` (valide les rapports, publie les annonces, voit tout l'espace), `responsable` (pilote un pôle : ses tâches, ses rapports), `membre` (ses tâches, réunions, documents), `formateur` (ses sessions et la visio de formation).
- **Notifications** : une table « notifications » (le centre dans l'espace) et l'envoi Web Push avec des clés VAPID, comme sur Le Monde du Travail. Gratuit, sans service tiers. Sur iPhone, les notifications ne marchent qu'une fois l'application installée sur l'écran d'accueil.
- **Visio** : Jitsi. Le service public meet.jit.si demande désormais à l'organisateur de se connecter avec un compte Google, GitHub ou Facebook. Pour une expérience sans friction, deux options : le service 8x8 JaaS (gratuit jusqu'à 25 utilisateurs par mois), ou un Jitsi installé sur le futur VPS Hostinger (gratuit, mais à maintenir). À trancher au lot F.
- **Hébergement** : tout ce chantier fonctionne sur Vercel. Le VPS reste une option, utile surtout pour héberger sa propre visio.
- **Envoi d'e-mails** : indispensable dès le lot C (mot de passe oublié, invitations, rappels). Il faut le mot de passe d'application du Gmail de l'ADET, ou une adresse sur un nom de domaine.

## Ce qu'il faut à l'ADET, lot par lot

- **Lot A** : le lien de la page Facebook, et les photos en fichiers d'origine (voir plus bas).
- **Lot B** : valider une direction visuelle parmi trois.
- **Lot C** : le mot de passe d'application Gmail (ou une adresse sur domaine) ; la liste des membres de l'équipe avec leur pôle, leur fonction et leur e-mail ou téléphone.
- **Lot E** : les modèles de rapports en usage (mensuel, par pôle…), le circuit de validation (qui valide quoi).
- **Lot F** : le choix du service de visio.

### Pourquoi les photos Facebook doivent passer par vous

Facebook bloque la récupération automatique des pages et réduit la qualité des images. La méthode fiable : un membre de l'équipe télécharge les photos depuis la page (ou depuis le téléphone qui les a prises, encore mieux) et les dépose dans un dossier partagé (Google Drive ou WhatsApp « en document »). Je m'occupe ensuite du tri, du recadrage, de la compression, des descriptions et des crédits. Le lien Facebook sert à reprendre les textes publics (activités, dates, partenaires) et à repérer les meilleures photos.
