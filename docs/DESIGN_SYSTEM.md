# Modern Design System

This document outlines the modern design system implemented for the Real Estate Hotspot platform.

## Overview

The design system provides a comprehensive set of CSS custom properties and Tailwind utilities for consistent styling across the application.

## CSS Custom Properties

### Colors

#### Primary Colors
- `--color-primary`: Main brand color (blue-700)
- `--color-primary-50` to `--color-primary-900`: Full primary color scale

#### Secondary Colors
- `--color-secondary`: Accent color (amber-500)
- `--color-secondary-50` to `--color-secondary-600`: Secondary color scale

#### Neutral Colors
- `--color-white`: Pure white
- `--color-gray-50` to `--color-gray-900`: Neutral gray scale

#### Semantic Colors
- `--color-success`: Success state color (green-600)
- `--color-warning`: Warning state color (yellow-500)
- `--color-error`: Error state color (red-600)

### Spacing System

Based on a 4px grid system:
- `--spacing-1`: 4px
- `--spacing-2`: 8px
- `--spacing-3`: 12px
- `--spacing-4`: 16px
- `--spacing-5`: 20px
- `--spacing-6`: 24px
- `--spacing-8`: 32px
- `--spacing-10`: 40px
- `--spacing-12`: 48px
- `--spacing-16`: 64px

### Border Radius

- `--radius-sm`: 4px (buttons, badges)
- `--radius-md`: 8px (cards, inputs)
- `--radius-lg`: 12px (modals, major containers)
- `--radius-xl`: 16px (hero sections, feature cards)

### Shadows

- `--shadow-sm`: Subtle shadow
- `--shadow-md`: Standard shadow
- `--shadow-lg`: Prominent shadow
- `--shadow-xl`: Large shadow
- `--shadow-2xl`: Extra large shadow
- `--shadow-card`: Card shadow
- `--shadow-card-hover`: Card hover shadow
- `--shadow-card-elevated`: Elevated card shadow

### Typography

#### Font Family
- `--font-family-primary`: Inter font stack

#### Font Sizes
- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-base`: 16px
- `--font-size-lg`: 18px
- `--font-size-xl`: 20px
- `--font-size-2xl`: 24px
- `--font-size-3xl`: 32px
- `--font-size-4xl`: 48px

#### Font Weights
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

#### Line Heights
- `--line-height-tight`: 1.2 (for headings)
- `--line-height-normal`: 1.4 (for body text)
- `--line-height-relaxed`: 1.6 (for large text blocks)

## Tailwind Utilities

### Modern Color Classes

```css
/* Primary colors */
.bg-primary-50, .bg-primary-100, .bg-primary-500, etc.
.text-primary-50, .text-primary-100, .text-primary-500, etc.
.border-primary-50, .border-primary-100, .border-primary-500, etc.

/* Semantic colors */
.bg-success-50, .bg-success-500, .bg-success-600
.bg-warning-50, .bg-warning-500
.bg-error-50, .bg-error-500, .bg-error-600
```

### Modern Shadow Classes

```css
.shadow-card
.shadow-card-hover
.shadow-card-elevated
.shadow-modern-sm
.shadow-modern-md
.shadow-modern-lg
.shadow-modern-xl
.shadow-modern-2xl
```

### Modern Spacing Classes

```css
.spacing-modern-xs
.spacing-modern-sm
.spacing-modern-md
.spacing-modern-lg
.spacing-modern-xl
```

### Modern Typography Classes

```css
.font-primary
.text-modern-xs, .text-modern-sm, .text-modern-base, etc.
.font-modern-normal, .font-modern-medium, .font-modern-semibold, .font-modern-bold
.leading-modern-tight, .leading-modern-normal, .leading-modern-relaxed
```

## Component Classes

### Cards

```css
.card-modern          /* Standard card with modern styling */
.card-modern-compact  /* Compact card with smaller padding */
.card-modern-elevated /* Elevated card with larger shadow */
```

### Buttons

```css
.btn-modern-primary   /* Primary button styling */
.btn-modern-secondary /* Secondary button styling */
```

### Inputs

```css
.input-modern         /* Modern input field styling */
```

### Navigation

```css
.nav-modern           /* Modern navigation bar */
.nav-modern-transparent /* Transparent navigation with backdrop blur */
```

### Modals

```css
.modal-backdrop       /* Modal backdrop with blur */
.modal-content        /* Modal content container */
```

### Typography

```css
.text-modern-heading  /* Modern heading styles */
.text-modern-body     /* Modern body text styles */
.text-modern-caption  /* Modern caption text styles */
```

## Usage Examples

### Using CSS Custom Properties

```css
.my-component {
  background-color: rgb(var(--color-primary-50));
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  font-family: var(--font-family-primary);
}
```

### Using Tailwind Classes

```jsx
<div className="bg-primary-50 p-spacing-4 rounded-radius-md shadow-card font-primary">
  <h2 className="text-modern-heading text-modern-2xl font-modern-semibold">
    Modern Heading
  </h2>
  <p className="text-modern-body text-modern-base">
    Modern body text with consistent styling.
  </p>
</div>
```

### Using Component Classes

```jsx
<div className="card-modern">
  <h3 className="text-modern-heading">Card Title</h3>
  <p className="text-modern-body">Card content</p>
  <button className="btn-modern-primary">Action</button>
</div>
```

## Design System Utilities

The design system includes utility functions in `src/lib/designSystem.ts`:

```typescript
import { modernClasses, getModernColor, validateDesignSystem } from '@/lib/designSystem';

// Use predefined class names
const cardClass = modernClasses.card;

// Get color with RGB format
const primaryColor = getModernColor('--color-primary');

// Validate design system is loaded
const isValid = validateDesignSystem();
```

## Best Practices

1. **Use CSS custom properties** for consistent theming
2. **Prefer component classes** for common patterns
3. **Use semantic color names** instead of specific color values
4. **Follow the spacing system** for consistent layouts
5. **Use the typography scale** for consistent text sizing
6. **Apply shadows consistently** using the shadow system

## Dark Mode Support

The design system includes basic dark mode support through CSS custom properties that automatically adjust based on `prefers-color-scheme: dark`.

## Accessibility

The design system ensures:
- Proper color contrast ratios (minimum 4.5:1 for normal text)
- Minimum touch target sizes (44px)
- Focus indicators for keyboard navigation
- High contrast mode support