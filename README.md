Vault est un coffre numérique ultra-rapide construit avec Next.js (App Router) et Prisma 7. Il combine une authentification simple par mot de passe maître avec un tableau de bord responsive où l’on peut enregistrer, rechercher, annoter et fusionner des documents & images tout en gardant une arborescence de mots-clés claire.

## Fonctionnalités principales
- **Authentification locale** : la page `/login` compare le mot de passe saisi avec la variable d’environnement `MASTERPASS`. Une fois authentifié, le mot de passe est conservé côté client pour authentifier les appels API.
- **Vault sécurisé** : `/vault` recharge les éléments sauvegardés depuis la base de données Prisma (PostgreSQL) via les routes API `/api/items`. Chaque item contient un titre, un contenu, une liste de mots-clés et des fichiers joints.
- **Recherche intelligente** : barre de recherche et arborescence de mots-clés fonctionnent en synchronisation pour filtrer instantanément les éléments par titre, contenu ou mot-clé, y compris avec les raccourcis clavier.
- **Gestion d’items** : création, édition et suppression via `ItemForm`, `ItemCard` et les routes API REST (GET/POST/PATCH/DELETE). Les fichiers peuvent être uploadés avec `/api/upload`.
- **Fusion PDF/image** : une route dédiée (`/api/items/[id]/merge`) convertit les images en PDF si besoin, fusionne tous les fichiers liés à l’item et stocke le résultat dans `public/uploads`.
- **Expérience fluide** : `FlickeringGrid`, animations, boutons flottants et menu de raccourcis (`Ctrl/Cmd + ?`) rappellent une ambiance cyberpunk sans sacrifier la clarté fonctionnelle.

## Architecture
- **Frontend** : Next.js 16 App Router, React 19, Tailwind CSS 4, composants serveur par défaut sauf pour `LoginForm` et `VaultPage` (`"use client"`) qui gèrent le state local, les formulaires et les interactions clavier.
- **Libs utilitaires** : `lib/items.ts` centralise les appels Prisma (conversion JSON ↔ tableaux). `lib/storage.ts` gère `localStorage`. `lib/useKeyboardShortcut.ts` et `lib/keyboard.ts` orchestrent les raccourcis et les touches spécifiques à la plateforme.
- **Backend** : routes API du dossier `app/api` :
  - `/api/auth` vérifie le `MASTERPASS` et renvoie un token basique.
  - `/api/items` expose les opérations CRUD et la recherche.
  - `/api/upload` persiste les fichiers sous `public/uploads`.
  - `/api/items/[id]/merge` combine les fichiers (PDF/images) en un PDF unique.
- **Base de données** : Prisma 7 avec un modèle `Item` (titre, content, fichiers, type, keywords, timestamps). Les champs complexifiés (keywords, files) sont sérialisés en JSON dans la colonne texte.

## Pré-requis
- Node.js 20+ (compatible avec `next dev`, `tsx`, `sharp`)
- PostgreSQL (ou un autre provider compatible Prisma); configurez `DATABASE_URL`.
- Copier les dépendances : `npm install`.
- Variables d’environnement essentielles :
  - `MASTERPASS` : mot de passe maître utilisé à la connexion.
  - `DATABASE_URL` : chaîne de connexion Prisma.

## Installation & développement
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init   # si la base est vierge
npm run seed                        # optionnel : charge les données de `prisma/seed.ts`
npm run dev
```

## Autres scripts utiles
- `npm run build` : génère la version de production (Next.js).
- `npm run start` : lance le serveur compilé issu de `next build`.
- `npm run lint` : vérifie la qualité du code (ESLint).
- `npm run seed` : exécute le seed Prisma en TypeScript via `tsx`.

## Raccourcis clavier supportés
- `Ctrl/Cmd + N` : créer un nouvel item.
- `Ctrl/Cmd + K` ou `/` : focus sur la barre de recherche.
- `Ctrl/Cmd + E` : ouvrir l’édition du premier item filtré.
- `Ctrl/Cmd + ?` (ou `Shift + /`) : basculer le menu d’aide.
- `Escape` est géré globalement pour fermer les dialogues/formulaires.

## Stockage des fichiers
- Les uploads passent par `/api/upload` et sont écrits dans `public/uploads/`. Les chemins publics sont renvoyés au client pour l’affichage.
- La fusion PDF/image génère un fichier `merged-*.pdf` dans le même dossier et met automatiquement à jour l’item associé.

## Sécurité et évolution
- L’authentification est volontairement minimaliste (comparaison directe de mot de passe et header `authorization`). Pour aller plus loin, il est conseillé d’introduire des vrais JWT/sessions, un hashing côté serveur (`bcryptjs` déjà installé) et une gestion des rôles.
- Les composants suivent la règle `une responsabilité = un fichier` pour favoriser la réutilisation, et la logique (Manager, ViewModel, Coordinator) reste isolée dans `lib/` ou `components/`.
