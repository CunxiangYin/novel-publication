# Theme & Styling Guidelines

## 1. Overview

This guide provides comprehensive theming and styling guidelines for the Novel Publication System, ensuring consistent visual design across all components and views.

## 2. Theme Philosophy

### 2.1 Core Principles
- **Readability First**: Optimize for extended reading and writing sessions
- **Contextual Themes**: Different themes for different tasks (reading, editing, reviewing)
- **User Preference**: Respect system preferences while allowing customization
- **Performance**: Minimize repaints and reflows during theme changes

### 2.2 Design Goals
- Create a warm, inviting atmosphere for literary work
- Reduce eye strain during long sessions
- Maintain professional appearance for publishing workflows
- Support both creative and analytical tasks

## 3. Color Theme System

### 3.1 Theme Structure

#### CSS Variables Architecture
```css
:root {
  /* Base colors - HSL format for easy manipulation */
  --primary-h: 234;
  --primary-s: 89%;
  --primary-l: 46%;
  
  /* Computed colors */
  --primary: hsl(var(--primary-h), var(--primary-s), var(--primary-l));
  --primary-light: hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) + 15%));
  --primary-dark: hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) - 15%));
}
```

### 3.2 Light Theme (Default)

#### Purpose
Mimics paper and traditional publishing materials for a familiar, comfortable experience.

```css
.light {
  /* Paper-like backgrounds */
  --background: 40 23% 97%;        /* Warm off-white */
  --surface: 40 37% 98%;           /* Slightly warmer white */
  --surface-variant: 40 20% 94%;   /* Alternative surface */
  
  /* Text colors */
  --text-primary: 224 39% 11%;     /* Rich dark blue-gray */
  --text-secondary: 224 20% 35%;   /* Softer text */
  --text-muted: 224 11% 45%;      /* De-emphasized text */
  
  /* Brand colors */
  --brand-primary: 234 89% 46%;    /* Deep ink blue */
  --brand-secondary: 36 100% 50%;  /* Warm amber accent */
  
  /* Interactive states */
  --hover: 40 15% 92%;
  --active: 40 20% 88%;
  --selected: 234 89% 95%;
  
  /* Semantic colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 55%;
  --info: 199 89% 48%;
}
```

### 3.3 Dark Theme

#### Purpose
Optimized for low-light environments and reduced eye strain.

```css
.dark {
  /* Rich, warm darks */
  --background: 224 28% 7%;        /* Deep charcoal */
  --surface: 224 28% 10%;          /* Elevated surface */
  --surface-variant: 224 25% 13%;  /* Alternative surface */
  
  /* Text colors */
  --text-primary: 40 23% 93%;      /* Soft warm white */
  --text-secondary: 40 15% 75%;    /* Dimmed text */
  --text-muted: 40 11% 65%;       /* Muted text */
  
  /* Brand colors - adjusted for dark */
  --brand-primary: 234 89% 62%;    /* Bright ink blue */
  --brand-secondary: 36 100% 50%;  /* Maintained amber */
  
  /* Interactive states */
  --hover: 224 20% 15%;
  --active: 224 20% 18%;
  --selected: 234 89% 20%;
  
  /* Semantic colors - adjusted */
  --success: 142 76% 46%;
  --warning: 38 92% 55%;
  --error: 0 62% 45%;
  --info: 199 89% 58%;
}
```

### 3.4 Sepia Theme (Reading Mode)

#### Purpose
Reduces blue light for comfortable extended reading.

```css
.sepia {
  /* Warm, book-like tones */
  --background: 39 39% 89%;        /* Sepia background */
  --surface: 39 35% 92%;           /* Light sepia */
  --surface-variant: 39 30% 86%;   /* Variant sepia */
  
  /* Warm text colors */
  --text-primary: 25 25% 20%;      /* Dark brown */
  --text-secondary: 25 20% 35%;    /* Medium brown */
  --text-muted: 25 15% 45%;       /* Light brown */
  
  /* Adjusted brand colors */
  --brand-primary: 25 70% 35%;     /* Brown primary */
  --brand-secondary: 36 100% 45%;  /* Amber secondary */
}
```

### 3.5 High Contrast Theme

#### Purpose
Accessibility mode for users requiring maximum contrast.

```css
.high-contrast {
  /* Maximum contrast */
  --background: 0 0% 100%;          /* Pure white */
  --surface: 0 0% 100%;            /* Pure white */
  --text-primary: 0 0% 0%;         /* Pure black */
  
  /* High contrast borders */
  --border: 0 0% 0%;
  --border-width: 2px;
  
  /* Bold colors */
  --brand-primary: 240 100% 50%;   /* Pure blue */
  --brand-secondary: 60 100% 50%;  /* Pure yellow */
}
```

## 4. Typography Theming

### 4.1 Font Stacks

```css
/* Default system fonts */
--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-serif: Georgia, Cambria, 'Times New Roman', serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Reading mode fonts */
--font-reading: 'Literata', Georgia, serif;
--font-heading: 'Playfair Display', Georgia, serif;
```

### 4.2 Typography Scales

#### Desktop Scale
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

#### Mobile Scale (Responsive)
```css
@media (max-width: 640px) {
  --text-base: 0.9375rem;  /* 15px */
  --text-lg: 1.0625rem;    /* 17px */
  --text-xl: 1.1875rem;    /* 19px */
  --text-2xl: 1.375rem;    /* 22px */
  --text-3xl: 1.625rem;    /* 26px */
  --text-4xl: 2rem;        /* 32px */
}
```

### 4.3 Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 1.75;
--leading-reading: 1.8;  /* For long-form content */
```

### 4.4 Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

## 5. Spacing Theme

### 5.1 Base Unit System
```css
--spacing-unit: 0.25rem;  /* 4px base */

/* Spacing scale */
--space-0: 0;
--space-1: calc(var(--spacing-unit) * 1);   /* 4px */
--space-2: calc(var(--spacing-unit) * 2);   /* 8px */
--space-3: calc(var(--spacing-unit) * 3);   /* 12px */
--space-4: calc(var(--spacing-unit) * 4);   /* 16px */
--space-5: calc(var(--spacing-unit) * 5);   /* 20px */
--space-6: calc(var(--spacing-unit) * 6);   /* 24px */
--space-8: calc(var(--spacing-unit) * 8);   /* 32px */
--space-10: calc(var(--spacing-unit) * 10); /* 40px */
--space-12: calc(var(--spacing-unit) * 12); /* 48px */
--space-16: calc(var(--spacing-unit) * 16); /* 64px */
--space-20: calc(var(--spacing-unit) * 20); /* 80px */
--space-24: calc(var(--spacing-unit) * 24); /* 96px */
```

### 5.2 Component Spacing
```css
/* Consistent component spacing */
--padding-xs: var(--space-2);
--padding-sm: var(--space-3);
--padding-md: var(--space-4);
--padding-lg: var(--space-6);
--padding-xl: var(--space-8);

/* Layout spacing */
--gap-xs: var(--space-2);
--gap-sm: var(--space-3);
--gap-md: var(--space-4);
--gap-lg: var(--space-6);
--gap-xl: var(--space-8);
```

## 6. Border & Radius Theme

### 6.1 Border Widths
```css
--border-width-thin: 1px;
--border-width-default: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;
```

### 6.2 Border Radius
```css
--radius-none: 0;
--radius-sm: 0.375rem;    /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-default: 0.625rem; /* 10px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Pill shape */
```

### 6.3 Border Styles
```css
/* Default borders */
.border-default {
  border: var(--border-width-default) solid var(--border);
}

/* Emphasis borders */
.border-emphasis {
  border: var(--border-width-medium) solid var(--border-emphasis);
}

/* Decorative borders */
.border-gradient {
  border-image: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-secondary)
  ) 1;
}
```

## 7. Shadow Theme

### 7.1 Shadow Scale
```css
--shadow-none: none;
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                  0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
             0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 7.2 Colored Shadows
```css
/* Brand colored shadows */
--shadow-primary: 0 4px 14px 0 rgba(var(--primary-rgb), 0.25);
--shadow-secondary: 0 4px 14px 0 rgba(var(--secondary-rgb), 0.25);

/* Status shadows */
--shadow-success: 0 4px 14px 0 rgba(var(--success-rgb), 0.25);
--shadow-warning: 0 4px 14px 0 rgba(var(--warning-rgb), 0.25);
--shadow-error: 0 4px 14px 0 rgba(var(--error-rgb), 0.25);
```

## 8. Animation Theme

### 8.1 Timing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 8.2 Durations
```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-default: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
--duration-slowest: 1000ms;
```

### 8.3 Animation Presets
```css
/* Fade animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Slide animations */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale animations */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## 9. Responsive Theming

### 9.1 Breakpoint Themes
```css
/* Mobile optimizations */
@media (max-width: 640px) {
  :root {
    --padding-base: var(--space-3);
    --gap-base: var(--space-3);
    --radius-default: 0.5rem;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  :root {
    --padding-base: var(--space-4);
    --gap-base: var(--space-4);
  }
}

/* Desktop optimizations */
@media (min-width: 1025px) {
  :root {
    --padding-base: var(--space-6);
    --gap-base: var(--space-6);
  }
}
```

### 9.2 Device-Specific Themes
```css
/* Touch devices */
@media (hover: none) {
  :root {
    --tap-target-min: 44px;
    --button-padding: var(--space-4);
  }
}

/* High-resolution displays */
@media (min-resolution: 2dppx) {
  :root {
    --border-width-default: 0.5px;
  }
}
```

## 10. Component-Specific Theming

### 10.1 Button Themes
```css
.btn-primary {
  background: var(--brand-primary);
  color: var(--text-on-primary);
  
  &:hover {
    background: var(--brand-primary-hover);
  }
  
  &:active {
    background: var(--brand-primary-active);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### 10.2 Card Themes
```css
.card {
  background: var(--surface);
  border: var(--border-width-default) solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-default);
  
  &.card-elevated {
    box-shadow: var(--shadow-lg);
  }
  
  &.card-flat {
    box-shadow: none;
    border: none;
  }
  
  &.card-outlined {
    box-shadow: none;
    border-width: var(--border-width-medium);
  }
}
```

### 10.3 Input Themes
```css
.input {
  background: var(--surface);
  border: var(--border-width-default) solid var(--border);
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }
  
  &.input-error {
    border-color: var(--error);
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(var(--error-rgb), 0.1);
    }
  }
  
  &.input-success {
    border-color: var(--success);
  }
}
```

## 11. Theme Implementation

### 11.1 CSS Custom Properties
```tsx
// theme.ts
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--space-${key}`, value);
  });
};
```

### 11.2 Theme Context
```tsx
// ThemeContext.tsx
interface ThemeContextValue {
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast';
  setTheme: (theme: string) => void;
  customColors?: Record<string, string>;
  setCustomColors: (colors: Record<string, string>) => void;
}

export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [customColors, setCustomColors] = useState({});
  
  useEffect(() => {
    document.documentElement.className = theme;
    applyCustomColors(customColors);
  }, [theme, customColors]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 11.3 Theme Persistence
```tsx
// useThemePersistence.ts
export const useThemePersistence = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });
  
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setActualTheme(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return { theme, setTheme };
};
```

## 12. Accessibility Theming

### 12.1 Color Contrast Requirements
```css
/* WCAG AA Compliance */
--contrast-normal: 4.5:1;  /* Normal text */
--contrast-large: 3:1;      /* Large text (18px+) */

/* WCAG AAA Compliance */
--contrast-enhanced-normal: 7:1;
--contrast-enhanced-large: 4.5:1;
```

### 12.2 Focus Indicators
```css
/* Visible focus styles */
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

/* High contrast focus */
.high-contrast :focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}
```

### 12.3 Motion Preferences
```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 13. Theme Testing

### 13.1 Theme Switching Test
```typescript
describe('Theme Switching', () => {
  it('should apply light theme', () => {
    applyTheme('light');
    expect(document.documentElement.className).toBe('light');
  });
  
  it('should persist theme preference', () => {
    setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
  
  it('should respect system preference', () => {
    setTheme('system');
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    expect(document.documentElement.className).toBe(isDark ? 'dark' : 'light');
  });
});
```

### 13.2 Contrast Testing
```typescript
describe('Color Contrast', () => {
  it('should meet WCAG AA standards', () => {
    const contrast = getContrastRatio(
      getCSSVariable('--text-primary'),
      getCSSVariable('--background')
    );
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});
```

## 14. Performance Optimization

### 14.1 CSS Variable Optimization
```css
/* Group related variables */
:root {
  /* Colors - grouped for single repaint */
  --color-set: var(--primary), var(--secondary), var(--background);
  
  /* Avoid calculated values in hot paths */
  --cached-spacing: 16px; /* Instead of calc() */
}
```

### 14.2 Theme Transition
```css
/* Smooth theme transitions */
html.theme-transitioning * {
  transition: background-color 200ms ease,
              color 200ms ease,
              border-color 200ms ease !important;
}
```

## 15. Advanced Theming

### 15.1 Dynamic Theme Generation
```typescript
// Generate theme from image
export const generateThemeFromImage = async (imageUrl: string) => {
  const palette = await extractColors(imageUrl);
  
  return {
    primary: palette.vibrant,
    secondary: palette.muted,
    background: palette.lightVibrant,
    text: palette.darkVibrant,
  };
};
```

### 15.2 User Custom Themes
```typescript
// Allow users to create custom themes
interface CustomTheme {
  name: string;
  colors: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, string>;
}

export const createCustomTheme = (config: CustomTheme) => {
  const theme = {
    ...defaultTheme,
    ...config,
  };
  
  saveTheme(theme);
  return theme;
};
```

### 15.3 Theme Marketplace
```typescript
// Share and download themes
export const exportTheme = (theme: Theme): string => {
  return JSON.stringify(theme, null, 2);
};

export const importTheme = (themeJson: string): Theme => {
  const theme = JSON.parse(themeJson);
  validateTheme(theme);
  return theme;
};
```