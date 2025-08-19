# Design System Documentation

## 1. Overview

The Novel Publication System design system is built on shadcn/ui components with custom enhancements optimized for a literary and publishing context. It emphasizes readability, elegant typography, and a warm, paper-like aesthetic that creates a comfortable environment for content creation and management.

## 2. Core Design Principles

### 2.1 Content-First Design
- **Hierarchy**: Clear visual hierarchy guides users through complex workflows
- **Readability**: Optimized typography and spacing for extended reading sessions
- **Focus**: Minimalist interface that doesn't distract from the content

### 2.2 Progressive Disclosure
- **Phased Complexity**: Show basic features first, advanced options on demand
- **Contextual Actions**: Display relevant actions when and where needed
- **Smart Defaults**: Intelligent pre-filled values based on content analysis

### 2.3 Responsive Intelligence
- **Adaptive Layouts**: Seamless transition between desktop and mobile views
- **Touch-Friendly**: Larger tap targets for mobile interactions
- **Performance**: Optimized rendering for large text documents

## 3. Color System

### 3.1 Light Theme (Default)
```css
/* Primary Palette - Ink Blue */
--primary: 234 89% 46%;           /* Deep ink blue - Main brand color */
--primary-foreground: 0 0% 100%;  /* White text on primary */

/* Secondary Palette - Warm Amber */
--secondary: 36 100% 50%;         /* Warm amber/gold - Accent color */
--secondary-foreground: 224 39% 11%;

/* Neutral Palette - Warm Grays */
--background: 40 23% 97%;         /* Warm off-white - Paper-like */
--foreground: 224 39% 11%;        /* Rich dark blue-gray */
--muted: 40 11% 93%;              /* Soft gray-beige */
--muted-foreground: 224 11% 45%;
```

### 3.2 Dark Theme
```css
/* Optimized for Reading */
--background: 224 28% 7%;         /* Deep charcoal with warmth */
--foreground: 40 23% 93%;         /* Soft warm white */
--primary: 234 89% 62%;           /* Bright ink blue */
--secondary: 36 100% 50%;         /* Maintained amber */
```

### 3.3 Semantic Colors
```css
/* Status Colors */
--success: 142 76% 36%;           /* Publishing success */
--warning: 38 92% 50%;            /* Validation warnings */
--destructive: 0 84% 55%;         /* Delete/error actions */

/* Special Purpose */
--accent: Amber tones for highlights
--border: Subtle separators
--ring: Focus indicators
```

### 3.4 Color Usage Guidelines

#### Primary Color (Ink Blue)
- **Use for**: Primary CTAs, active states, brand elements
- **Examples**: Publish button, selected tabs, progress indicators
- **Avoid**: Overuse that dilutes importance

#### Secondary Color (Warm Amber)
- **Use for**: Highlights, achievements, secondary actions
- **Examples**: Success badges, chapter highlights, AI features
- **Avoid**: As primary navigation color

#### Neutral Tones
- **Use for**: Backgrounds, text, borders, disabled states
- **Strategy**: Layer warm grays to create depth without harsh contrasts

## 4. Typography System

### 4.1 Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, 
             'Noto Sans', sans-serif;
```

### 4.2 Type Scale
```scss
// Headings
.text-4xl: 2.25rem (36px) - Page titles
.text-3xl: 1.875rem (30px) - Section headers
.text-2xl: 1.5rem (24px) - Card titles
.text-xl: 1.25rem (20px) - Subsection headers
.text-lg: 1.125rem (18px) - Large body text

// Body
.text-base: 1rem (16px) - Default body text
.text-sm: 0.875rem (14px) - Secondary text
.text-xs: 0.75rem (12px) - Captions, labels

// Special
.prose-reading: 1.125rem with 1.75 line-height - Novel content
```

### 4.3 Font Weights
```scss
.font-normal: 400 - Body text
.font-medium: 500 - Subtle emphasis
.font-semibold: 600 - Headers, buttons
.font-bold: 700 - Strong emphasis
```

### 4.4 Typography Guidelines

#### Readability First
- **Line Height**: 1.5 for UI text, 1.75 for reading content
- **Max Width**: 65-75 characters for optimal reading
- **Paragraph Spacing**: 1rem between paragraphs in content

#### Hierarchy
- **Clear Levels**: Maximum 3 levels of hierarchy per view
- **Consistent Sizing**: Maintain size relationships across views
- **Weight + Size**: Combine both for clear differentiation

## 5. Spacing System

### 5.1 Base Unit
8px grid system for consistent spacing

### 5.2 Scale
```scss
spacing-0: 0
spacing-1: 0.25rem (4px)
spacing-2: 0.5rem (8px)
spacing-3: 0.75rem (12px)
spacing-4: 1rem (16px)
spacing-5: 1.25rem (20px)
spacing-6: 1.5rem (24px)
spacing-8: 2rem (32px)
spacing-10: 2.5rem (40px)
spacing-12: 3rem (48px)
spacing-16: 4rem (64px)
```

### 5.3 Usage Patterns
- **Component Padding**: spacing-4 (16px) default
- **Section Gaps**: spacing-6 to spacing-8
- **Card Spacing**: spacing-6 internal, spacing-4 between cards
- **Form Fields**: spacing-2 between label and input

## 6. Component Styling

### 6.1 Elevation System
```scss
// No elevation (flat)
.elevation-0: No shadow

// Subtle elevation
.elevation-1: 0 1px 3px rgba(0,0,0,0.12)

// Card elevation
.elevation-2: 0 4px 6px rgba(0,0,0,0.1)

// Modal/dropdown elevation
.elevation-3: 0 10px 15px rgba(0,0,0,0.1)

// Hover states
.elevation-hover: 0 8px 16px rgba(0,0,0,0.15)
```

### 6.2 Border Radius
```scss
--radius: 0.625rem (10px) - Default
.rounded-sm: calc(var(--radius) - 4px) - Small elements
.rounded-md: calc(var(--radius) - 2px) - Medium elements
.rounded-lg: var(--radius) - Cards, modals
.rounded-xl: 1rem - Special containers
.rounded-full: 9999px - Circular elements
```

### 6.3 Animation & Transitions

#### Standard Transitions
```scss
.transition-colors: color 150ms ease
.transition-all: all 200ms ease
.transition-transform: transform 200ms ease
```

#### Custom Animations
```scss
// Fade in with slide
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

// Loading pulse
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 7. Layout System

### 7.1 Container Widths
```scss
.container {
  max-width: 1400px; // 2xl screens
  padding: 2rem;
  margin: 0 auto;
}

// Content widths
.max-w-2xl: 672px - Forms, settings
.max-w-3xl: 768px - Reading content
.max-w-4xl: 896px - Main content areas
.max-w-6xl: 1152px - Wide layouts
```

### 7.2 Grid System
```scss
// Responsive grid
.grid-cols-1 // Mobile
.md:grid-cols-2 // Tablet
.lg:grid-cols-3 // Desktop
.xl:grid-cols-4 // Wide screens

// Gap utilities
.gap-4: 1rem
.gap-6: 1.5rem
.gap-8: 2rem
```

### 7.3 Flexbox Patterns
```scss
// Common patterns
.flex-center: flex items-center justify-center
.flex-between: flex items-center justify-between
.flex-start: flex items-center justify-start
.flex-col: flex flex-col
```

## 8. Interactive States

### 8.1 Hover States
- **Buttons**: Slight opacity reduction (90%)
- **Cards**: Subtle shadow elevation + translate-y(-2px)
- **Links**: Underline or color change
- **List Items**: Background highlight

### 8.2 Focus States
```scss
.focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### 8.3 Active States
- **Buttons**: Slight scale reduction (0.98)
- **Tabs**: Bottom border indicator
- **Cards**: Border or background change

### 8.4 Disabled States
```scss
.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
```

## 9. Responsive Design

### 9.1 Breakpoints
```scss
sm: 640px   // Small devices
md: 768px   // Tablets
lg: 1024px  // Desktops
xl: 1280px  // Large screens
2xl: 1536px // Extra large
```

### 9.2 Mobile-First Approach
- Start with mobile layout
- Progressively enhance for larger screens
- Touch-friendly tap targets (min 44x44px)

### 9.3 Responsive Patterns
- **Navigation**: Hamburger menu on mobile, full nav on desktop
- **Cards**: Stack on mobile, grid on desktop
- **Forms**: Full-width on mobile, constrained on desktop
- **Typography**: Smaller sizes on mobile

## 10. Special Effects

### 10.1 Glassmorphism
```scss
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 10.2 Gradient Overlays
```scss
.gradient-overlay {
  background: linear-gradient(
    135deg,
    rgba(var(--primary-rgb), 0.1),
    rgba(var(--secondary-rgb), 0.05)
  );
}
```

### 10.3 Loading States
- **Skeleton screens**: Animated placeholders
- **Progress indicators**: Linear or circular
- **Shimmer effects**: Subtle animation while loading

## 11. Implementation Examples

### 11.1 Primary Button
```tsx
<Button className="
  bg-primary 
  text-primary-foreground 
  hover:bg-primary/90 
  transition-colors 
  duration-200
  font-semibold
  px-4 py-2
  rounded-lg
">
  Publish Novel
</Button>
```

### 11.2 Feature Card
```tsx
<Card className="
  bg-card
  border border-border
  rounded-lg
  p-6
  hover:shadow-lg
  hover:-translate-y-0.5
  transition-all
  duration-200
">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">
      Chapter Management
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 11.3 Status Badge
```tsx
<Badge className="
  bg-success/10
  text-success
  border border-success/20
  px-2 py-1
  text-xs
  font-medium
">
  Published
</Badge>
```

## 12. Best Practices

### 12.1 Consistency
- Use design tokens consistently
- Follow established patterns
- Maintain visual rhythm

### 12.2 Performance
- Optimize animations for 60fps
- Use CSS transforms over position changes
- Lazy load heavy components

### 12.3 Accessibility
- Maintain WCAG AA contrast ratios
- Provide focus indicators
- Support keyboard navigation
- Include ARIA labels

### 12.4 Maintainability
- Use semantic class names
- Document custom styles
- Keep specificity low
- Leverage utility classes

## 13. Design Token Reference

```javascript
// Core tokens
export const tokens = {
  // Colors
  colors: {
    primary: 'hsl(234, 89%, 46%)',
    secondary: 'hsl(36, 100%, 50%)',
    background: 'hsl(40, 23%, 97%)',
    foreground: 'hsl(224, 39%, 11%)',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  // Typography
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  // Borders
  borderRadius: {
    sm: '0.375rem',
    DEFAULT: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
}
```

## 14. Migration Guide

### From Default shadcn/ui
1. Update color variables in CSS
2. Apply custom spacing scale
3. Implement enhanced components
4. Add animation utilities
5. Test responsive breakpoints

### Component Updates
- Replace default Button with enhanced variants
- Use custom Card styles with hover effects
- Implement loading states for async operations
- Add glassmorphism effects where appropriate

## 15. Future Enhancements

### Planned Features
- **Dynamic Themes**: User-customizable color schemes
- **Motion Preferences**: Respect reduced-motion settings
- **Component Variants**: More style options per component
- **Dark Mode Improvements**: Better contrast and readability
- **Print Styles**: Optimized layouts for printing

### Research Areas
- **Variable Fonts**: Better typography control
- **CSS Container Queries**: Component-level responsiveness
- **View Transitions API**: Smoother page transitions
- **Color Mix**: Dynamic color generation