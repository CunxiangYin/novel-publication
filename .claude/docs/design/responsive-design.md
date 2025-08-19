# Responsive Design Principles

## 1. Overview

This document outlines the responsive design principles and implementation strategies for the Novel Publication System, ensuring optimal user experience across all devices and screen sizes.

## 2. Core Principles

### 2.1 Mobile-First Approach
- Start with mobile layout as the base
- Progressively enhance for larger screens
- Prioritize content and core functionality
- Optimize performance for mobile networks

### 2.2 Fluid Design
- Use flexible grids and layouts
- Employ relative units (rem, em, %, vw, vh)
- Create scalable components
- Maintain proportional spacing

### 2.3 Content Priority
- Essential content first
- Progressive disclosure for complex features
- Context-aware information density
- Adaptive content strategies

## 3. Breakpoint System

### 3.1 Standard Breakpoints

```scss
// Breakpoint definitions
$breakpoints: (
  'xs': 0,      // Extra small devices (phones, <640px)
  'sm': 640px,  // Small devices (large phones, ≥640px)
  'md': 768px,  // Medium devices (tablets, ≥768px)
  'lg': 1024px, // Large devices (desktops, ≥1024px)
  'xl': 1280px, // Extra large devices (large desktops, ≥1280px)
  '2xl': 1536px // 2X large devices (larger desktops, ≥1536px)
);
```

### 3.2 Breakpoint Usage

```css
/* Mobile First Approach */
.container {
  /* Base mobile styles */
  width: 100%;
  padding: 1rem;
}

/* Small devices */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
  }
}

/* Medium devices */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
    padding: 2rem;
  }
}

/* Large devices */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Extra large devices */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
    padding: 2.5rem;
  }
}

/* 2X large devices */
@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
    padding: 3rem;
  }
}
```

### 3.3 Device-Specific Breakpoints

```css
/* Portrait phones */
@media (max-width: 480px) and (orientation: portrait) {
  .mobile-portrait {
    /* Specific styles for portrait phones */
  }
}

/* Landscape phones */
@media (min-width: 480px) and (max-width: 768px) and (orientation: landscape) {
  .mobile-landscape {
    /* Specific styles for landscape phones */
  }
}

/* Tablets */
@media (min-width: 768px) and (max-width: 1024px) {
  .tablet {
    /* Tablet-specific styles */
  }
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .touch-device {
    /* Touch-optimized styles */
  }
}

/* High-resolution displays */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .retina {
    /* High-DPI specific styles */
  }
}
```

## 4. Layout Strategies

### 4.1 Grid Systems

#### CSS Grid Implementation
```css
/* Responsive grid with auto-fit */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

/* Explicit responsive grid */
.grid-responsive {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr; /* Mobile: 1 column */
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
  }
}

@media (min-width: 1280px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr); /* Large desktop: 4 columns */
  }
}
```

#### Flexbox Patterns
```css
/* Responsive flex container */
.flex-container {
  display: flex;
  flex-direction: column; /* Stack on mobile */
  gap: 1rem;
}

@media (min-width: 768px) {
  .flex-container {
    flex-direction: row; /* Side-by-side on tablet+ */
    flex-wrap: wrap;
  }
}

/* Responsive card layout */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 100%; /* Full width on mobile */
}

@media (min-width: 640px) {
  .card {
    flex: 1 1 calc(50% - 0.5rem); /* 2 columns on small screens */
  }
}

@media (min-width: 1024px) {
  .card {
    flex: 1 1 calc(33.333% - 0.75rem); /* 3 columns on desktop */
  }
}
```

### 4.2 Container Queries (Future CSS)

```css
/* Container query support (when available) */
@container (min-width: 400px) {
  .card-content {
    display: flex;
    gap: 1rem;
  }
}

@container (min-width: 600px) {
  .card-content {
    padding: 2rem;
  }
}
```

## 5. Typography Responsiveness

### 5.1 Fluid Typography

```css
/* Clamp for fluid sizing */
.fluid-text {
  /* Minimum 1rem, preferred 4vw, maximum 1.5rem */
  font-size: clamp(1rem, 4vw, 1.5rem);
}

/* Heading scales */
h1 {
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.2;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.3;
}

h3 {
  font-size: clamp(1.25rem, 3vw, 2rem);
  line-height: 1.4;
}

/* Body text */
body {
  font-size: clamp(0.9375rem, 2vw, 1.125rem);
  line-height: 1.6;
}
```

### 5.2 Responsive Type Scale

```css
/* Mobile type scale */
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
}

/* Tablet adjustments */
@media (min-width: 768px) {
  :root {
    --text-base: 1.0625rem;
    --text-lg: 1.1875rem;
    --text-xl: 1.375rem;
    --text-2xl: 1.75rem;
    --text-3xl: 2.25rem;
    --text-4xl: 3rem;
  }
}

/* Desktop adjustments */
@media (min-width: 1024px) {
  :root {
    --text-base: 1.125rem;
    --text-lg: 1.25rem;
    --text-xl: 1.5rem;
    --text-2xl: 2rem;
    --text-3xl: 2.5rem;
    --text-4xl: 3.5rem;
  }
}
```

### 5.3 Line Length Control

```css
/* Optimal reading width */
.text-content {
  max-width: 65ch; /* ~65 characters per line */
  margin: 0 auto;
  padding: 0 1rem;
}

/* Responsive line length */
@media (min-width: 768px) {
  .text-content {
    max-width: 70ch;
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .text-content {
    max-width: 75ch;
  }
}
```

## 6. Component Responsiveness

### 6.1 Navigation Patterns

#### Mobile Navigation
```tsx
const ResponsiveNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          className="hamburger-menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        
        <nav
          className={`mobile-nav ${isOpen ? 'open' : ''}`}
          aria-hidden={!isOpen}
        >
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </>
    );
  }
  
  return (
    <nav className="desktop-nav">
      <ul className="flex gap-4">
        {navItems.map(item => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

#### CSS for Navigation
```css
/* Mobile navigation */
.mobile-nav {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  max-width: 320px;
  height: 100vh;
  background: var(--background);
  transition: left 0.3s ease;
  z-index: 1000;
}

.mobile-nav.open {
  left: 0;
}

/* Desktop navigation */
@media (min-width: 769px) {
  .desktop-nav {
    display: flex;
    align-items: center;
  }
  
  .hamburger-menu {
    display: none;
  }
}
```

### 6.2 Form Responsiveness

```css
/* Responsive form layout */
.form-container {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* Two-column layout on larger screens */
@media (min-width: 768px) {
  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Form field responsiveness */
.form-field {
  width: 100%;
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  min-height: 44px; /* Touch-friendly */
  font-size: 16px; /* Prevent zoom on iOS */
}

@media (min-width: 768px) {
  .form-field input,
  .form-field textarea,
  .form-field select {
    min-height: 40px;
  }
}
```

### 6.3 Table Responsiveness

```css
/* Responsive table - horizontal scroll */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Card layout for mobile */
@media (max-width: 767px) {
  .responsive-table {
    display: block;
  }
  
  .responsive-table thead {
    display: none;
  }
  
  .responsive-table tbody {
    display: block;
  }
  
  .responsive-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
  }
  
  .responsive-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border: none;
  }
  
  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 1rem;
  }
}
```

### 6.4 Card Component

```tsx
// Responsive card component
const ResponsiveCard = ({ title, content, image, actions }) => {
  return (
    <div className="card">
      {image && (
        <div className="card-image">
          <img src={image} alt="" loading="lazy" />
        </div>
      )}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-text">{content}</p>
      </div>
      {actions && (
        <div className="card-actions">
          {actions}
        </div>
      )}
    </div>
  );
};
```

```css
/* Card responsive styles */
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Horizontal card on larger screens */
@media (min-width: 768px) {
  .card.horizontal {
    flex-direction: row;
  }
  
  .card.horizontal .card-image {
    width: 40%;
    aspect-ratio: auto;
  }
  
  .card.horizontal .card-content {
    flex: 1;
  }
}
```

## 7. Image Responsiveness

### 7.1 Responsive Images

```html
<!-- Picture element for art direction -->
<picture>
  <source
    media="(min-width: 1024px)"
    srcset="hero-desktop.webp"
    type="image/webp"
  >
  <source
    media="(min-width: 768px)"
    srcset="hero-tablet.webp"
    type="image/webp"
  >
  <source
    srcset="hero-mobile.webp"
    type="image/webp"
  >
  <img
    src="hero-fallback.jpg"
    alt="Hero image"
    loading="lazy"
    decoding="async"
  >
</picture>

<!-- Srcset for resolution switching -->
<img
  src="image-400.jpg"
  srcset="image-400.jpg 400w,
          image-800.jpg 800w,
          image-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="Responsive image"
>
```

### 7.2 CSS Responsive Images

```css
/* Fluid images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Aspect ratio boxes */
.aspect-ratio-box {
  position: relative;
  width: 100%;
}

.aspect-ratio-box::before {
  content: "";
  display: block;
  padding-top: 56.25%; /* 16:9 aspect ratio */
}

.aspect-ratio-box > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Modern aspect-ratio property */
.modern-aspect {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}
```

### 7.3 Background Images

```css
/* Responsive background images */
.hero-banner {
  height: 50vh;
  background-image: url('hero-mobile.jpg');
  background-size: cover;
  background-position: center;
}

@media (min-width: 768px) {
  .hero-banner {
    height: 60vh;
    background-image: url('hero-tablet.jpg');
  }
}

@media (min-width: 1024px) {
  .hero-banner {
    height: 70vh;
    background-image: url('hero-desktop.jpg');
  }
}

/* High-DPI backgrounds */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .hero-banner {
    background-image: url('hero-mobile@2x.jpg');
  }
}
```

## 8. Touch Optimization

### 8.1 Touch Targets

```css
/* Minimum touch target size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Spacing between touch targets */
.touch-target + .touch-target {
  margin-left: 8px;
}

/* Larger targets on touch devices */
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: 48px;
    padding: 12px 20px;
    font-size: 16px;
  }
  
  .input {
    min-height: 48px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
```

### 8.2 Gesture Support

```tsx
// Swipe gesture support
const useSwipeGesture = (onSwipeLeft: Function, onSwipeRight: Function) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const threshold = 50;
    
    if (distance > threshold) {
      onSwipeLeft();
    } else if (distance < -threshold) {
      onSwipeRight();
    }
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
```

## 9. Performance Optimization

### 9.1 Responsive Loading

```tsx
// Lazy loading for different screen sizes
const ResponsiveImage = ({ mobileSrc, tabletSrc, desktopSrc, alt }) => {
  const [src, setSrc] = useState('');
  
  useEffect(() => {
    const updateSrc = () => {
      if (window.innerWidth >= 1024) {
        setSrc(desktopSrc);
      } else if (window.innerWidth >= 768) {
        setSrc(tabletSrc);
      } else {
        setSrc(mobileSrc);
      }
    };
    
    updateSrc();
    window.addEventListener('resize', updateSrc);
    
    return () => window.removeEventListener('resize', updateSrc);
  }, [mobileSrc, tabletSrc, desktopSrc]);
  
  return <img src={src} alt={alt} loading="lazy" />;
};
```

### 9.2 Conditional Component Loading

```tsx
// Load components based on screen size
const ResponsiveComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [DesktopComponent, setDesktopComponent] = useState(null);
  
  useEffect(() => {
    if (!isMobile) {
      import('./DesktopComponent').then(module => {
        setDesktopComponent(() => module.default);
      });
    }
  }, [isMobile]);
  
  if (isMobile) {
    return <MobileComponent />;
  }
  
  return DesktopComponent ? <DesktopComponent /> : <Loading />;
};
```

## 10. Testing Responsive Design

### 10.1 Device Testing

```typescript
// Viewport testing utilities
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

describe('Responsive Design Tests', () => {
  Object.entries(viewports).forEach(([device, { width, height }]) => {
    describe(`${device} viewport`, () => {
      beforeEach(() => {
        cy.viewport(width, height);
      });
      
      it('should display correctly', () => {
        cy.visit('/');
        cy.get('.container').should('be.visible');
        
        if (device === 'mobile') {
          cy.get('.hamburger-menu').should('be.visible');
          cy.get('.desktop-nav').should('not.be.visible');
        } else {
          cy.get('.hamburger-menu').should('not.be.visible');
          cy.get('.desktop-nav').should('be.visible');
        }
      });
    });
  });
});
```

### 10.2 Visual Regression Testing

```javascript
// Backstop.js configuration
module.exports = {
  scenarios: [
    {
      label: 'Homepage',
      url: 'http://localhost:3000',
      viewports: [
        { label: 'phone', width: 320, height: 568 },
        { label: 'tablet', width: 768, height: 1024 },
        { label: 'desktop', width: 1920, height: 1080 }
      ]
    }
  ]
};
```

## 11. Common Patterns

### 11.1 Responsive Utilities

```css
/* Visibility utilities */
.mobile-only {
  display: block;
}

.tablet-up {
  display: none;
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
  
  .tablet-up {
    display: block;
  }
}

@media (min-width: 1024px) {
  .desktop-only {
    display: block;
  }
  
  .tablet-only {
    display: none;
  }
}
```

### 11.2 Responsive Spacing

```css
/* Responsive padding/margin utilities */
.p-responsive {
  padding: 1rem;
}

@media (min-width: 768px) {
  .p-responsive {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .p-responsive {
    padding: 2rem;
  }
}

/* Gap utilities */
.gap-responsive {
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .gap-responsive {
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .gap-responsive {
    gap: 1.5rem;
  }
}
```

## 12. Best Practices

### 12.1 Do's
- ✅ Use relative units (rem, em, %, vw, vh)
- ✅ Test on real devices
- ✅ Optimize images for each breakpoint
- ✅ Use CSS Grid and Flexbox for layouts
- ✅ Implement touch-friendly interfaces
- ✅ Consider landscape orientations
- ✅ Test with different zoom levels

### 12.2 Don'ts
- ❌ Use fixed pixel widths for containers
- ❌ Hide essential content on mobile
- ❌ Rely only on hover interactions
- ❌ Use tiny fonts on mobile
- ❌ Forget about landscape orientation
- ❌ Disable zooming
- ❌ Use desktop-only features

## 13. Future Considerations

### 13.1 Container Queries
```css
/* Future CSS - Container Queries */
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

### 13.2 Viewport Units
```css
/* New viewport units */
.fullscreen {
  height: 100svh; /* Small viewport height */
  height: 100dvh; /* Dynamic viewport height */
  height: 100lvh; /* Large viewport height */
}
```

### 13.3 Logical Properties
```css
/* Logical properties for internationalization */
.card {
  margin-inline: auto; /* margin-left and margin-right */
  padding-block: 1rem; /* padding-top and padding-bottom */
  inset-inline-start: 0; /* left in LTR, right in RTL */
}
```