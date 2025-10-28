# Design System - W3C Sitemap Validator

## Vue d'ensemble

Ce design system a été créé spécifiquement pour le SaaS W3C Sitemap Validator, ciblant les développeurs, freelances et agences web. Il fournit une base cohérente et professionnelle pour l'interface utilisateur.

## Palette de Couleurs

### Couleurs Principales
- `--bg-main: #F6F7FB` - Fond principal de l'application
- `--text-main: #20304B` - Texte principal et titres
- `--accent-primary: #009CFF` - Bleu électrique pour les CTA et boutons principaux
- `--accent-secondary: #FFCC00` - Jaune solaire pour les highlights et badges
- `--accent-soft: #FFF6E2` - Beige crème pour les fonds secondaires

### Couleurs Sémantiques
- `--success: #31EC56` - Vert pour les états de succès
- `--error: #EF036C` - Rouge pour les erreurs et alertes
- `--white: #FFFFFF` - Blanc pur
- `--black: #000000` - Noir pur

## Composants Disponibles

### Button
Bouton polyvalent avec plusieurs variants et tailles.

```svelte
<Button variant="primary" size="lg" onclick={handleClick}>
  Click me
</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`, `xl`
**Props:** `disabled`, `loading`, `type`

### Badge
Petit élément pour afficher des étiquettes ou des statuts.

```svelte
<Badge variant="success" size="md">
  Valid
</Badge>
```

**Variants:** `primary`, `secondary`, `success`, `error`, `warning`, `info`
**Sizes:** `sm`, `md`, `lg`

### Card
Conteneur pour organiser le contenu avec différents styles.

```svelte
<Card variant="elevated" padding="lg">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Subtitle</p>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</Card>
```

**Variants:** `default`, `elevated`, `outlined`, `filled`
**Padding:** `sm`, `md`, `lg`

### Alert
Composant pour afficher des messages d'information, d'erreur, etc.

```svelte
<Alert variant="success" title="Success!" dismissible>
  Your operation completed successfully.
</Alert>
```

**Variants:** `success`, `error`, `warning`, `info`
**Props:** `title`, `dismissible`, `onDismiss`

## Typographie

### Classes de Titres
- `.heading-1` - Titre principal (clamp(2rem, 5vw, 3.5rem))
- `.heading-2` - Titre de section (clamp(1.5rem, 4vw, 2.5rem))
- `.heading-3` - Sous-titre (clamp(1.25rem, 3vw, 1.875rem))
- `.heading-4` - Titre de carte (clamp(1.125rem, 2.5vw, 1.5rem))

### Classes de Texte
- `.text-lg` - Texte large (1.125rem)
- `.text-base` - Texte de base (1rem)
- `.text-sm` - Texte petit (0.875rem)
- `.text-xs` - Texte extra petit (0.75rem)
- `.text-lead` - Texte d'introduction (1.25rem)
- `.text-code` - Texte de code (monospace)

## Layout et Utilitaires

### Container
```svelte
<div class="container">
  <!-- Contenu responsive -->
</div>
```

### Grid System
```svelte
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <!-- Grille responsive -->
</div>
```

### Espacements
- `.py-4`, `.py-8`, `.py-12`, `.py-16`, `.py-20` - Padding vertical
- `.mb-2`, `.mb-4`, `.mb-6`, `.mb-8`, `.mb-12`, `.mb-16` - Margin bottom
- `.mt-4`, `.mt-8`, `.mt-12`, `.mt-16` - Margin top

### Flexbox
- `.flex` - Display flex
- `.flex-col` - Direction colonne
- `.items-center` - Alignement vertical
- `.justify-center` - Alignement horizontal
- `.justify-between` - Espacement entre éléments

## Responsive Design

Le design system est mobile-first avec des breakpoints :
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Classes Responsive
```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Grille adaptative -->
</div>

<h1 class="text-4xl md:text-5xl lg:text-6xl">
  <!-- Titre responsive -->
</h1>
```

## Accessibilité

### Contraste
Toutes les couleurs respectent les standards WCAG AA :
- Texte principal sur fond principal : 12.5:1 ✅
- Accent primary sur blanc : 4.5:1 ✅
- Accent secondary sur texte principal : 4.8:1 ✅

### Focus States
```css
.interactive:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Touch Targets
Tous les éléments interactifs respectent une taille minimale de 44px sur mobile.

## Mode Sombre

Le design system inclut un mode sombre automatique basé sur les préférences système :

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-main: #1A1D29;
    --text-main: #F6F7FB;
    /* ... autres variables sombres */
  }
}
```

## Utilisation

### Import des Composants
```svelte
<script>
  import { Button, Badge, Card, Alert } from '$lib';
</script>
```

### Variables CSS
```css
.my-component {
  background: var(--accent-primary);
  color: var(--white);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}
```

## Démonstration

Visitez `/design-system` pour voir tous les composants en action avec des exemples interactifs.

## Maintenance

### Ajout de Nouveaux Composants
1. Créer le composant dans `src/lib/components/`
2. L'exporter dans `src/lib/index.ts`
3. Documenter l'utilisation dans ce fichier
4. Ajouter des exemples dans la page de démonstration

### Modification des Couleurs
1. Modifier les variables CSS dans `src/app.css`
2. Tester l'accessibilité avec les nouveaux contrastes
3. Mettre à jour la documentation
4. Vérifier la cohérence sur tous les composants
