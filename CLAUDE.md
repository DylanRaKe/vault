# Dev NextJS

## Stack
- Next.js 16 App Router
- TypeScript strict
- Tailwind CSS
- React Server Components par défaut

## Règles code
- Composants serveur sauf si interactivité (useState, onClick, etc.)
- 'use client' uniquement si nécessaire
- Nommage: PascalCase composants, camelCase fonctions
- Un composant = un fichier
- Pas de any, typage strict

## Structure fichiers
- /app pour routes
- /components pour composants réutilisables
- /lib pour utils/helpers
- /types pour interfaces TypeScript

## Bonnes pratiques
- Async/await pour fetch côté serveur
- Loading.tsx et error.tsx dans chaque route
- Metadata export pour SEO
- Image component Next.js obligatoire

## Interdit
- Client components inutiles
- Fetch côté client si possible côté serveur
- CSS inline (utiliser Tailwind)
- Console.log en production

## Performance
- Lazy loading avec dynamic()
- Optimisation images automatique
- Cache et revalidation configurés

## Prisma 7
- Utiliser `prisma-client-js` comme provider dans schema.prisma
- Adapter SQLite: `@prisma/adapter-better-sqlite3` obligatoire
- Output path: `../generated/prisma` dans schema.prisma
- Configuration Next.js: `serverExternalPackages` pour modules natifs
- Webpack externals pour `better-sqlite3` et adapter
- Client Prisma: utiliser `PrismaBetterSqlite3` avec `{ url: dbPath }`
- Seed: utiliser `tsx` pour exécuter les scripts TypeScript
- Génération: `npx prisma generate` après modification du schema
- Migrations: `npx prisma migrate dev` pour créer les migrations

## Raccourcis clavier
- Détection automatique de la plateforme (Mac/Windows-Linux) via `lib/keyboard.ts`
- Affichage conditionnel: `⌘` sur Mac, `Ctrl` sur Windows/Linux
- Hook personnalisé `useKeyboardShortcut` dans `lib/useKeyboardShortcut.ts` pour gérer les raccourcis
- Raccourcis disponibles:
  - `Ctrl/Cmd + N`: Créer un nouvel item
  - `Ctrl/Cmd + K` ou `/`: Focus sur la barre de recherche
  - `Ctrl/Cmd + E`: Éditer le premier item de la liste filtrée
  - `Ctrl/Cmd + S`: Sauvegarder (dans le formulaire)
  - `Ctrl/Cmd + ?`: Ouvrir/fermer le menu d'aide des raccourcis
  - `Escape`: Fermer les dialogs/formulaires
- Menu d'aide accessible via `Ctrl/Cmd + ?` affichant tous les raccourcis
- Les raccourcis ne se déclenchent pas dans les champs de saisie sauf si `allowInInput: true`