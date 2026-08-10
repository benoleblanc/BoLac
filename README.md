# BoLac

PWA mobile-first de cartes hors ligne et de suivi GPS (GPX) pour le canot, le
kayak et le paddleboard — conçue pour fonctionner **entièrement hors réseau**
une fois sur l'eau.

## Stack

- **Vite + React 19 + TypeScript** (strict) — SPA pure, aucun backend
- **Tailwind CSS v4** — mobile-first, mode clair/sombre
- **Zustand** — état global (thème/navigation, tracking, carte)
- **Dexie.js** (IndexedDB) — stockage local principal (trajets, waypoints, photos, tuiles hors ligne)
- **react-leaflet** — cartographie, fond de carte [OpenTopoMap](https://opentopomap.org)
- **vite-plugin-pwa** — service worker, manifest, installabilité

## Démarrer

```bash
npm install
npm run dev       # serveur de dev
npm run build     # build de prod + vérification TypeScript
npm run preview   # sert le build de prod localement
npm run lint       # oxlint
npm run format     # prettier --write .
```

## État du projet

Cette fondation pose la structure, le stockage local et une carte
fonctionnelle. Les lots suivants restent à implémenter :

- **Tracking GPS en direct** — squelette dans `src/stores/trackingStore.ts`
- **Waypoints** ("mises à l'eau" + bouton "S'y rendre" vers Google Maps)
- **Photos géolocalisées**
- **Cache de tuiles hors ligne** — téléchargement d'une zone choisie à l'avance (bbox + zooms), stockage dans la table Dexie `tiles`
- **Export GPX / sauvegarde globale (zip)** — générateur GPX déjà fonctionnel dans `src/lib/gpx/buildGpx.ts`, reste à câbler l'archive zip et le bouton d'export

## Structure

Organisation par domaine fonctionnel (`src/features/<domaine>`) plutôt que
par type de fichier générique — voir `src/features/` (map, tracking, trips,
waypoints, photos, export, settings), `src/stores/`, `src/lib/` (db, geo,
gpx) et `src/types/` pour le schéma de données complet.
