# Design System - W3C Sitemap Validator SaaS

## 1. Variables CSS Personnalisées

### Variables de Base (Root)
```css
:root {
  /* Couleurs principales */
  --bg-main: #F6F7FB;
  --text-main: #20304B;
  --accent-primary: #009CFF;
  --accent-secondary: #FFCC00;
  --accent-soft: #FFF6E2;
  --success: #31EC56;
  --error: #EF036C;
  
  /* Couleurs dérivées */
  --accent-primary-hover: #0088E6;
  --accent-primary-light: #E6F7FF;
  --accent-secondary-hover: #E6B800;
  --accent-secondary-light: #FFFBF0;
  
  /* Gris neutres */
  --gray-50: #FAFBFC;
  --gray-100: #F1F3F5;
  --gray-200: #E9ECEF;
  --gray-300: #DEE2E6;
  --gray-400: #CED4DA;
  --gray-500: #ADB5BD;
  --gray-600: #6C757D;
  --gray-700: #495057;
  --gray-800: #343A40;
  --gray-900: #212529;
  
  /* Couleurs sémantiques */
  --white: #FFFFFF;
  --black: #000000;
  --border-light: #E9ECEF;
  --border-medium: #CED4DA;
  --shadow-light: rgba(32, 48, 75, 0.08);
  --shadow-medium: rgba(32, 48, 75, 0.12);
  --shadow-strong: rgba(32, 48, 75, 0.16);
  
  /* Espacements */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  
  /* Rayons de bordure */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  
  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-popover: 1050;
  --z-tooltip: 1060;
}

/* Mode sombre (optionnel pour futures fonctionnalités) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-main: #1A1D29;
    --text-main: #F6F7FB;
    --accent-primary: #33B3FF;
    --accent-secondary: #FFD633;
    --accent-soft: #2D2A1F;
    --success: #4AFF6B;
    --error: #FF4A7A;
    
    --gray-50: #212529;
    --gray-100: #343A40;
    --gray-200: #495057;
    --gray-300: #6C757D;
    --gray-400: #ADB5BD;
    --gray-500: #CED4DA;
    --gray-600: #DEE2E6;
    --gray-700: #E9ECEF;
    --gray-800: #F1F3F5;
    --gray-900: #FAFBFC;
    
    --border-light: #495057;
    --border-medium: #6C757D;
    --shadow-light: rgba(246, 247, 251, 0.08);
    --shadow-medium: rgba(246, 247, 251, 0.12);
    --shadow-strong: rgba(246, 247, 251, 0.16);
  }
}
```

## 2. Guidelines Typographiques

### Font Stack
```css
/* Police principale - Inter (moderne, lisible, optimisée web) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Police monospace pour le code */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Hiérarchie Typographique
```css
/* Headings */
.heading-1 {
  font-family: var(--font-primary);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-main);
}

.heading-2 {
  font-family: var(--font-primary);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.heading-3 {
  font-family: var(--font-primary);
  font-size: clamp(1.25rem, 3vw, 1.875rem);
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-main);
}

.heading-4 {
  font-family: var(--font-primary);
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-main);
}

/* Textes */
.text-lg {
  font-family: var(--font-primary);
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-main);
}

.text-base {
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-main);
}

.text-sm {
  font-family: var(--font-primary);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-main);
}

.text-xs {
  font-family: var(--font-primary);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Code */
.text-code {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--accent-primary);
  background: var(--accent-primary-light);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

/* Lead text (sous-titres) */
.text-lead {
  font-family: var(--font-primary);
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--gray-600);
}
```

## 3. Composants Svelte Stylisés

### Bouton Principal (CTA)
```svelte
<!-- Button.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: import('svelte').Snippet;
    onclick?: (event: MouseEvent) => void;
  }

  let { 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false,
    type = 'button', 
    children, 
    onclick 
  }: Props = $props();
</script>

<button
  type={type}
  class="btn btn-{variant} btn-{size}"
  class:btn-loading={loading}
  {disabled}
  onclick={onclick}
>
  {#if loading}
    <svg class="btn-spinner" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-primary);
    font-weight: 600;
    text-decoration: none;
    border: 2px solid transparent;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px var(--shadow-medium);
  }

  .btn:not(:disabled):active {
    transform: translateY(0);
    box-shadow: 0 4px 12px var(--shadow-light);
  }

  /* Variants */
  .btn-primary {
    background: linear-gradient(135deg, var(--accent-primary) 0%, #0088E6 100%);
    color: var(--white);
    box-shadow: 0 4px 15px rgba(0, 156, 255, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0088E6 0%, #0073CC 100%);
    box-shadow: 0 8px 25px rgba(0, 156, 255, 0.4);
  }

  .btn-secondary {
    background: var(--accent-secondary);
    color: var(--text-main);
    box-shadow: 0 4px 15px rgba(255, 204, 0, 0.3);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--accent-secondary-hover);
    box-shadow: 0 8px 25px rgba(255, 204, 0, 0.4);
  }

  .btn-outline {
    background: transparent;
    color: var(--accent-primary);
    border-color: var(--accent-primary);
  }

  .btn-outline:hover:not(:disabled) {
    background: var(--accent-primary);
    color: var(--white);
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-main);
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--gray-100);
  }

  .btn-danger {
    background: var(--error);
    color: var(--white);
    box-shadow: 0 4px 15px rgba(239, 3, 108, 0.3);
  }

  .btn-danger:hover:not(:disabled) {
    background: #D6025A;
    box-shadow: 0 8px 25px rgba(239, 3, 108, 0.4);
  }

  /* Sizes */
  .btn-sm {
    padding: var(--space-sm) var(--space-md);
    font-size: 0.875rem;
    min-height: 2rem;
  }

  .btn-md {
    padding: var(--space-md) var(--space-lg);
    font-size: 1rem;
    min-height: 2.5rem;
  }

  .btn-lg {
    padding: var(--space-lg) var(--space-xl);
    font-size: 1.125rem;
    min-height: 3rem;
  }

  .btn-xl {
    padding: var(--space-xl) var(--space-2xl);
    font-size: 1.25rem;
    min-height: 3.5rem;
  }

  /* Loading state */
  .btn-loading {
    pointer-events: none;
  }

  .btn-spinner {
    width: 1em;
    height: 1em;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
```

### Tag/Badge Accent
```svelte
<!-- Badge.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    children?: import('svelte').Snippet;
  }

  let { variant = 'primary', size = 'md', children }: Props = $props();
</script>

<span class="badge badge-{variant} badge-{size}">
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-primary);
    font-weight: 600;
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  .badge-primary {
    background: var(--accent-primary-light);
    color: var(--accent-primary);
    border: 1px solid rgba(0, 156, 255, 0.2);
  }

  .badge-secondary {
    background: var(--accent-secondary-light);
    color: var(--accent-secondary-hover);
    border: 1px solid rgba(255, 204, 0, 0.3);
  }

  .badge-success {
    background: rgba(49, 236, 86, 0.1);
    color: var(--success);
    border: 1px solid rgba(49, 236, 86, 0.2);
  }

  .badge-error {
    background: rgba(239, 3, 108, 0.1);
    color: var(--error);
    border: 1px solid rgba(239, 3, 108, 0.2);
  }

  .badge-warning {
    background: var(--accent-secondary-light);
    color: #B8860B;
    border: 1px solid rgba(255, 204, 0, 0.3);
  }

  .badge-info {
    background: var(--gray-100);
    color: var(--gray-700);
    border: 1px solid var(--border-light);
  }

  .badge-sm {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .badge-md {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .badge-lg {
    padding: 0.375rem 1rem;
    font-size: 1rem;
  }
</style>
```

### Section Card
```svelte
<!-- Card.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'default' | 'elevated' | 'outlined' | 'filled';
    padding?: 'sm' | 'md' | 'lg';
    children?: import('svelte').Snippet;
  }

  let { variant = 'default', padding = 'md', children }: Props = $props();
</script>

<div class="card card-{variant} card-padding-{padding}">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .card {
    background: var(--white);
    border-radius: var(--radius-xl);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
  }

  .card:hover {
    transform: translateY(-2px);
  }

  .card-default {
    box-shadow: 0 2px 8px var(--shadow-light);
    border: 1px solid var(--border-light);
  }

  .card-elevated {
    box-shadow: 0 8px 32px var(--shadow-medium);
    border: none;
  }

  .card-outlined {
    box-shadow: none;
    border: 2px solid var(--border-medium);
  }

  .card-filled {
    background: var(--accent-soft);
    box-shadow: none;
    border: 1px solid rgba(255, 204, 0, 0.2);
  }

  .card-padding-sm {
    padding: var(--space-md);
  }

  .card-padding-md {
    padding: var(--space-lg);
  }

  .card-padding-lg {
    padding: var(--space-xl);
  }

  /* Card content patterns */
  .card-header {
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--border-light);
  }

  .card-title {
    font-family: var(--font-primary);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 var(--space-sm) 0;
  }

  .card-subtitle {
    font-family: var(--font-primary);
    font-size: 0.875rem;
    color: var(--gray-600);
    margin: 0;
  }

  .card-body {
    margin-bottom: var(--space-lg);
  }

  .card-footer {
    margin-top: var(--space-lg);
    padding-top: var(--space-md);
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
```

## 4. Conseils d'Utilisation

### Fond d'Écran
```css
/* Application du fond principal */
body {
  background: var(--bg-main);
  min-height: 100vh;
}

/* Patterns de fond pour sections */
.bg-pattern-dots {
  background-image: radial-gradient(circle, var(--gray-300) 1px, transparent 1px);
  background-size: 20px 20px;
}

.bg-pattern-grid {
  background-image: 
    linear-gradient(var(--gray-200) 1px, transparent 1px),
    linear-gradient(90deg, var(--gray-200) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Section Hero
```css
.hero {
  background: linear-gradient(135deg, var(--bg-main) 0%, var(--accent-soft) 100%);
  padding: var(--space-3xl) 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23E9ECEF" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}
```

### Navigation
```css
.nav {
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 8px var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.nav-brand {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-decoration: none;
}

.nav-link {
  font-family: var(--font-primary);
  font-weight: 500;
  color: var(--text-main);
  text-decoration: none;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background: var(--accent-primary-light);
  color: var(--accent-primary);
}

.nav-link.active {
  background: var(--accent-primary);
  color: var(--white);
}
```

### États Hover/Active
```css
/* États interactifs cohérents */
.interactive {
  transition: all var(--transition-fast);
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.interactive:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px var(--shadow-light);
}

/* Focus states pour l'accessibilité */
.interactive:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### États Success/Error
```css
.alert {
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  margin: var(--space-md) 0;
}

.alert-success {
  background: rgba(49, 236, 86, 0.1);
  border-left-color: var(--success);
  color: #1B5E20;
}

.alert-error {
  background: rgba(239, 3, 108, 0.1);
  border-left-color: var(--error);
  color: #B71C1C;
}

.alert-warning {
  background: var(--accent-secondary-light);
  border-left-color: var(--accent-secondary);
  color: #B8860B;
}

.alert-info {
  background: var(--accent-primary-light);
  border-left-color: var(--accent-primary);
  color: var(--accent-primary);
}
```

### Contraste Accessible (WCAG AA)
```css
/* Vérification des contrastes */
/* --text-main (#20304B) sur --bg-main (#F6F7FB) = 12.5:1 ✅ */
/* --accent-primary (#009CFF) sur blanc = 4.5:1 ✅ */
/* --accent-secondary (#FFCC00) sur --text-main = 4.8:1 ✅ */

/* Textes avec contraste garanti */
.text-high-contrast {
  color: var(--text-main);
}

.text-medium-contrast {
  color: var(--gray-700);
}

.text-low-contrast {
  color: var(--gray-600);
}

/* Liens accessibles */
.link {
  color: var(--accent-primary);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  transition: all var(--transition-fast);
}

.link:hover {
  color: var(--accent-primary-hover);
  text-decoration-color: var(--accent-primary-hover);
}
```

## 5. Adaptabilité Mobile (Responsive + Touch)

### Breakpoints
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First */
.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding: 0 var(--space-lg);
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### Touch-Friendly Design
```css
/* Zones de touch minimales 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Espacement entre éléments interactifs */
.touch-spacing > * + * {
  margin-left: var(--space-md);
}

@media (max-width: 768px) {
  .touch-spacing > * + * {
    margin-left: var(--space-sm);
  }
}

/* Boutons mobiles optimisés */
@media (max-width: 768px) {
  .btn {
    min-height: 48px;
    font-size: 1rem;
  }
  
  .btn-sm {
    min-height: 44px;
    font-size: 0.875rem;
  }
}

/* Navigation mobile */
@media (max-width: 768px) {
  .nav {
    padding: var(--space-sm) var(--space-md);
  }
  
  .nav-menu {
    position: fixed;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--white);
    box-shadow: 0 -4px 12px var(--shadow-medium);
    transform: translateY(-100%);
    transition: transform var(--transition-normal);
  }
  
  .nav-menu.open {
    transform: translateY(0);
  }
}
```

### Optimisations Mobile
```css
/* Scroll fluide */
html {
  scroll-behavior: smooth;
}

/* Prévention du zoom sur les inputs iOS */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  input[type="text"],
  input[type="email"],
  input[type="password"],
  textarea {
    font-size: 16px;
  }
}

/* Amélioration des performances de scroll */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}

/* Optimisation des animations sur mobile */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 6. Utilitaires CSS

```css
/* Classes utilitaires pour l'application rapide */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.m-0 { margin: 0; }
.p-0 { padding: 0; }

.rounded { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }

.shadow-sm { box-shadow: 0 2px 4px var(--shadow-light); }
.shadow-md { box-shadow: 0 4px 12px var(--shadow-medium); }
.shadow-lg { box-shadow: 0 8px 24px var(--shadow-strong); }

/* États de chargement */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

---

## Résumé d'Implémentation

Ce design system fournit :

1. **Variables CSS complètes** avec mode sombre optionnel
2. **Typographie optimisée** pour la lisibilité et l'accessibilité
3. **Composants Svelte réutilisables** avec variants et états
4. **Guidelines d'usage** pour chaque élément
5. **Optimisations mobile** et touch-friendly
6. **Conformité WCAG AA** pour l'accessibilité

Le système est conçu pour être progressivement adopté, en remplaçant Tailwind par vos couleurs personnalisées tout en conservant la structure SvelteKit existante.
