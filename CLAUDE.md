# CLAUDE.md

Ce fichier guide Claude Code (claude.ai/code) lorsqu'il travaille sur ce dépôt.

## Projet

Site vitrine statique de **DIAGO** (diagnostic humidité indépendant, Paris et Île-de-France), publié sur **https://diago-humidite.fr** (fichier `CNAME`, hébergement type GitHub Pages). Tout le contenu est en français.

Il n'y a ni build, ni gestionnaire de paquets, ni tests : chaque page est un fichier `.html` autonome à la racine. Pour prévisualiser le site, servir la racine avec un serveur HTTP local (les chemins absolus comme `/js/tracking.js` ne fonctionnent pas en `file://`) :

```bash
python -m http.server 8000
```

## Structure

- `*.html` à la racine : une page par sujet. Elles sont regroupées par familles SEO :
  - pages départementales `diagnostic-humidite-<département>-<n°>.html` (75, 77, 78, 91, 92, 93, 94, 95) ;
  - pages par type de bien ou de contexte (`diagnostic-humidite-maison.html`, `-appartement`, `-copropriete`, `-avant-achat`, `-avant-travaux`…) ;
  - pages pathologies (`salpetre.html`, `moisissures.html`, `cloque-peinture.html`, `taches-humidite.html`…), illustrées par `photo-pathologies/` ;
  - pages fonctionnelles : `demande-diagnostic.html`, `merci.html`, `avis.html`, `avis-clients.html`, `mentions-legales.html`.
- `css/style.css` : feuille de styles unique, partagée par toutes les pages.
- `js/` :
  - `tracking.js` : consentement cookies + Google Ads, Google Analytics, Microsoft Clarity. Chargé en premier dans le `<head>` de **toutes** les pages ; c'est le seul endroit où figurent les identifiants de suivi (bloc `CONFIG`).
  - `main.js` : menu mobile, défilement doux, envoi du formulaire `#contactForm` vers un Google Apps Script (`GOOGLE_SCRIPT_URL`), puis redirection vers `/merci.html` (page qui déclenche la conversion Ads).
  - `avis-config.js` : unique définition de `window.DIAGO_AVIS_URL` (script Google « Avis DIAGO »).
  - `temoignages.js` : affiche les avis publiés à partir des attributs `data-avis-liste`, `data-avis-bloc`, `data-avis-resume`, `data-avis-vide`.
- `sitemap.xml`, `robots.txt` : SEO. `3322b3545a1a6846ba25ab97bc5c398e.txt` est un fichier de vérification de clé (IndexNow) : ne pas le supprimer ni le renommer.

## Conventions

- **Pas de gabarit partagé** : l'en-tête, le menu, le pied de page et le formulaire sont recopiés dans chaque page. Une modification de navigation ou de footer doit être répercutée sur toutes les pages `.html` concernées.
- Chaque page contient ses propres balises SEO : `<title>`, `meta description`, `link rel="canonical"` (URL absolue `https://diago-humidite.fr/...`), Open Graph et JSON-LD Schema.org. Les garder cohérentes avec le contenu et le nom de fichier.
- Lors de l'ajout ou de la modification importante d'une page, mettre à jour `sitemap.xml` (`<loc>` et `<lastmod>`) et ajouter des liens internes depuis les pages proches.
- Ne jamais coller de code de suivi directement dans une page : passer par `js/tracking.js`. De même, les URL des Google Apps Scripts ne vivent que dans `main.js` et `avis-config.js`.
- JavaScript sans dépendance ni module, compatible navigateurs anciens (`var`, IIFE, `try/catch` autour de `localStorage`). Commentaires en français.
- Dépendances externes via CDN uniquement : Google Fonts (Inter, Montserrat) et Font Awesome 6.4.0 (jsDelivr).
- Images de pathologies dans `photo-pathologies/`, avec un `alt` descriptif en français.
