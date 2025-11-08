# Composants Réutilisables

## PageLayout

Template de page réutilisable pour les vues en plein écran (Options, Stats, etc.)

### Utilisation

```tsx
import PageLayout from '../components/PageLayout';

function MyPage() {
  const language = 'en'; // ou 'fr'
  
  return (
    <PageLayout 
      title="My Page Title"
      icon={<img src="/icons/icon48.png" alt="Icon" />}
      language={language}
    >
      {/* Votre contenu ici */}
      <div>Page content goes here</div>
    </PageLayout>
  );
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Titre de la page affiché dans le header |
| `icon` | `ReactNode` | Icône ou élément React affiché avant le titre (optionnel) |
| `children` | `ReactNode` | Contenu principal de la page |
| `language` | `'en' \| 'fr'` | Langue courante pour les traductions du footer |

### Fonctionnalités

- **Header sticky** : Le header reste visible en haut lors du scroll
- **Footer automatique** : Affiche automatiquement l'icône, version, et lien GitHub
- **Responsive** : S'adapte aux écrans mobiles et desktop
- **Thème** : Supporte automatiquement les modes light/dark via les variables CSS
- **Padding cohérent** : Applique un padding standard au contenu

### Structure

```
┌─────────────────────────────┐
│  Header (sticky)            │
│  • Icon + Title             │
├─────────────────────────────┤
│                             │
│  Content Area               │
│  (children)                 │
│                             │
│                             │
├─────────────────────────────┤
│  Footer                     │
│  • Version + Made by        │
└─────────────────────────────┘
```

### Pages utilisant PageLayout

- **Options** (`src/options/options.tsx`) : Page de paramètres avec onglets
- **Stats** (`src/stats/StatsPage.tsx`) : Page de statistiques avec onglets

### Personnalisation

Le composant utilise les variables CSS définies dans `PageLayout.css` :
- `--bg-primary` : Couleur de fond principale
- `--bg-secondary` : Couleur de fond du header/footer
- `--border-color` : Couleur des bordures
- `--text-primary` : Couleur du texte principal
- `--text-secondary` : Couleur du texte secondaire
- `--color-primary` : Couleur d'accent (liens)
- `--shadow-sm` : Ombre subtile

### Avantages

✅ **Cohérence visuelle** : Même apparence sur toutes les pages  
✅ **DRY** : Pas de duplication de code header/footer  
✅ **Maintenabilité** : Un seul endroit pour modifier le layout global  
✅ **Accessibilité** : Structure HTML sémantique  
✅ **Performance** : CSS optimisé avec transitions smooth
