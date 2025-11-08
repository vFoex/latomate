# Types Structure

Ce dossier contient tous les types TypeScript pour LaTomate, organisés par catégorie.

## Structure des fichiers

### `timer.ts`
Types liés au fonctionnement du timer :
- `TimerState` - État du timer (idle, running, paused)
- `SessionType` - Type de session (work, shortBreak, longBreak)
- `TimerMode` - Mode du timer (pomodoro, intensive, 52-17, custom)

### `session.ts`
Types liés à l'enregistrement et aux statistiques des sessions :
- `SessionRecord` - Enregistrement complet d'une session
- `SessionStats` - Statistiques agrégées (streaks, focus time, etc.)

### `settings.ts`
Types liés aux paramètres utilisateur :
- `PomodoroSettings` - Paramètres de configuration du timer

### `storage.ts`
Types liés à la structure de Chrome Storage :
- `StorageData` - Structure globale des données stockées

### `index.ts`
Point d'entrée qui réexporte tous les types pour une importation simplifiée.

## Usage

### Import depuis l'index (recommandé)
```typescript
import type { SessionRecord, TimerMode, SessionType } from '../types';
```

### Import direct d'un fichier spécifique
```typescript
import type { SessionRecord } from '../types/session';
import type { TimerMode } from '../types/timer';
```

## Conventions

- Tous les types sont exportés avec `export type` pour éviter l'inclusion dans le bundle
- Les interfaces utilisent `PascalCase`
- Les types unions utilisent `PascalCase`
- Les commentaires expliquent les unités (minutes, seconds, etc.)
