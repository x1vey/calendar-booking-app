// ─── lib/themes.ts ───────────────────────────────────────────────────────────
// Central registry for all aesthetic calendar themes.
// Each theme entry declares presentational metadata + the component name that
// will be dynamically imported at render time.
//
// CSS TEMPLATE CUSTOMISATION
// --------------------------
// Every theme also ships with a `cssTemplate` string — raw CSS that is injected
// into the booking page via a <style> tag.  Business owners (or you, the dev)
// can override any custom property listed there to restyle the calendar without
// touching component code.  The variables follow a consistent naming scheme:
//
//   --ct-bg          primary background
//   --ct-surface     card / panel surface
//   --ct-text        body text
//   --ct-heading     large heading text
//   --ct-accent      primary interactive colour (buttons, selection rings …)
//   --ct-accent-fg   foreground on top of accent colour (usually white or dark)
//   --ct-border      subtle border / divider colour
//   --ct-muted       muted / placeholder text
//
// HTML SLOT OVERRIDES
// -------------------
// Set `htmlOverrides` to inject arbitrary HTML into named slots inside the
// calendar component wrapper.  Currently supported slots:
//   header-prefix   — content rendered before the calendar title
//   header-suffix   — content rendered after the calendar title / nav row
//   footer          — content rendered below the time-slot grid
//
// This makes it trivial to inject logos, banners or legal copy without forking
// the component.
// ─────────────────────────────────────────────────────────────────────────────

export type CalendarTheme = 'fitness' | 'tattoo' | 'garment' | 'default';

export interface ThemeHtmlOverrides {
  /** Raw HTML string injected before the calendar heading */
  headerPrefix?: string;
  /** Raw HTML string injected after the month-navigation row */
  headerSuffix?: string;
  /** Raw HTML string injected below the slot grid */
  footer?: string;
}

export interface ThemeStyles {
  accentColor?: string | null;
  bgColor?: string | null;
  surfaceColor?: string | null;
  textColor?: string | null;
  headingColor?: string | null;
  accentFgColor?: string | null;
  borderColor?: string | null;
  mutedColor?: string | null;
  fontStack?: 'sans' | 'serif' | 'mono' | null;
  animationStyle?: 'fade' | 'slide' | 'pop' | 'none' | null;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full' | null;
  buttonShape?: 'solid' | 'outline' | 'ghost' | null;
  borderWidth?: 'none' | 'thin' | 'medium' | 'thick' | null;
  shadowStyle?: 'none' | 'soft' | 'strong' | null;
  texture?: 'none' | 'noise' | 'weave' | 'dots' | 'svg' | null;
  headingFont?: string | null;
  bodyFont?: string | null;
}

export interface ThemeMeta {
  label: string;
  description: string;
  /** Hex used for the theme-picker card background preview */
  previewBg: string;
  /** Hex accent — used as the default --ct-accent value */
  accent: string;
  /** Component filename (without extension) inside components/calendars/ */
  component: string;
  /**
   * Raw CSS injected into a <style> tag on the booking page.
   * Consumers may override any --ct-* variable to restyle without forking
   * the component.
   */
  cssTemplate: string;
  /** Default font stack for the theme */
  fontStack: 'sans' | 'serif' | 'mono';
  /** Labels for UI text elements */
  labels: Record<string, string>;
  /** Optional custom content for the theme */
  content?: Record<string, any>;
  /**
   * Optional raw HTML fragments injected into named slots inside the calendar
   * wrapper.  Useful for logos, banners, or legal copy.
   */
  htmlOverrides?: ThemeHtmlOverrides;
}

// ─── Font Stacks ─────────────────────────────────────────────────────────────
const FONTS = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  serif: "'Outfit', 'Playfair Display', 'Georgia', serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Default CSS template (shared baseline) ──────────────────────────────────
const BASE_CSS = `
  /* callme calendar — base custom properties */
  :root {
    --ct-bg:        #ffffff;
    --ct-surface:   #f8fafc;
    --ct-text:      #0f172a;
    --ct-heading:   #0f172a;
    --ct-accent:    #6366f1;
    --ct-accent-fg: #ffffff;
    --ct-border:    rgba(0,0,0,0.08);
    --ct-muted:     #94a3b8;
    --ct-font:      ${FONTS.sans};
    --ct-radius:    0.5rem;
    --ct-border-width: 1px;
    --ct-shadow:    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

// ─── Theme registry ───────────────────────────────────────────────────────────
export const THEMES: Record<CalendarTheme, ThemeMeta> = {

  // ── 1. Fitness / Form Studio ────────────────────────────────────────────────
  fitness: {
    label:       'Fitness Performance',
    description: 'High-energy, bold aesthetics for gyms and trainers.',
    previewBg:   '#0d0d0d',
    accent:      '#facc15',
    component:   'FitnessBookingCalendar',
    fontStack:   'sans',
    labels: {
      masthead_title: 'Level Up',
      masthead_sub: 'Choose your intensity and grab a slot.',
      picker_title: 'Training Schedule',
      cta_button: 'CLAIM SLOT',
      status_loading: 'PREPARING SESSIONS...',
      status_empty: 'FULLY BOOKED'
    },
    content: {
      intensity_labels: ['Low', 'Medium', 'High', 'Elite']
    },
    cssTemplate: `
      :root {
        --ct-bg:        #0d0d0d;
        --ct-surface:   #1a1a1a;
        --ct-text:      #f0ede6;
        --ct-heading:   #f0ede6;
        --ct-accent:    #c8f542;
        --ct-accent-fg: #0d0d0d;
        --ct-border:    #1c1c1c;
        --ct-muted:     #444444;
        --ct-font:      ${FONTS.sans};
      }
    `,
  },

  // ── 2. Tattoo / Ink & Ether ─────────────────────────────────────────────────
  tattoo: {
    label:       'Ink & Ether',
    description: 'Warm parchment and editorial typography. Ideal for tattoo studios and boutique artists.',
    previewBg:   '#f7f3ee',
    accent:      '#c9a87c',
    component:   'TattooBookingCalendar',
    fontStack:   'serif',
    labels: {
      masthead_title: 'Wear your story.',
      masthead_sub: 'Every piece is drawn for you, on you.',
      picker_title: 'SELECT A DATE',
      cta_button: 'RESERVE',
      status_loading: 'RECALLING AVAILABILITY...',
      status_empty: 'NO SESSIONS ON THIS DATE',
      nav_items: 'ARTISTS,FLASH,AFTERCARE',
      ticker_items: 'CUSTOM WORK,FINE LINE,BOTANICAL,BLACKWORK,BY APPOINTMENT,DEPOSIT REQUIRED'
    },
    cssTemplate: `
      :root {
        --ct-bg:        #f7f3ee;
        --ct-surface:   #f7f3ee;
        --ct-text:      #1a1410;
        --ct-heading:   #1a1410;
        --ct-accent:    #c9a87c;
        --ct-accent-fg: #f7f3ee;
        --ct-border:    #e2dbd0;
        --ct-muted:     #a89880;
        --ct-font:      ${FONTS.serif};
      }
    `,
  },

  // ── 3. Garment / Vélin Atelier ───────────────────────────────────────────────
  garment: {
    label:       'Vélin Atelier',
    description: 'Old-money luxury with refined serif fonts. Tailored for tailors, designers, and high-end consultancies.',
    previewBg:   '#fdfaf6',
    accent:      '#b8a88a',
    component:   'GarmentBookingCalendar',
    fontStack:   'serif',
    labels: {
      masthead_title: 'Bespoke Fitting',
      masthead_sub: 'Measurements and consultation for your next piece.',
      picker_title: 'The Atelier Calendar',
      cta_button: 'Book Appointment',
      status_loading: 'Consulting schedule...',
      status_empty: 'Atelier is closed.'
    },
    cssTemplate: `
      :root {
        --ct-bg:        #fdfaf6;
        --ct-surface:   #fdfaf6;
        --ct-text:      #2a2118;
        --ct-heading:   #2a2118;
        --ct-accent:    #b8a88a;
        --ct-accent-fg: #fdfaf6;
        --ct-border:    #e8e0d4;
        --ct-muted:     #b8a898;
        --ct-font:      ${FONTS.serif};
      }
    `,
  },

  // ── 4. Classic / Default ────────────────────────────────────────────────────
  default: {
    label:       'Classic',
    description: 'Clean and neutral. Works for any business.',
    previewBg:   '#ffffff',
    accent:      '#6366f1',
    component:   'DefaultBookingCalendar',
    fontStack:   'sans',
    labels: {
      masthead_title: 'Book a Session',
      masthead_sub: 'Find a time that works for you.',
      picker_title: 'Select a Date',
      cta_button: 'Confirm Booking',
      status_loading: 'Loading slots...',
      status_empty: 'No availability found.'
    },
    cssTemplate: BASE_CSS,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the theme metadata for a given key, falling back to 'default'. */
export function getTheme(key: string | null | undefined): ThemeMeta {
  const k = (key ?? 'default') as CalendarTheme;
  return THEMES[k] ?? THEMES.default;
}

/** Returns the CSS for a theme, optionally merging in per-business overrides. */
export function buildThemeCSS(
  key: string | null | undefined,
  overrides?: ThemeStyles,
): string {
  const theme = getTheme(key);
  let css = theme.cssTemplate;

  // Inject business-level CSS variable overrides after the template
  const vars: string[] = [];
  if (overrides?.accentColor)   vars.push(`--ct-accent: ${overrides.accentColor};`);
  if (overrides?.bgColor)       vars.push(`--ct-bg: ${overrides.bgColor};`);
  if (overrides?.surfaceColor)   vars.push(`--ct-surface: ${overrides.surfaceColor};`);
  if (overrides?.textColor)     vars.push(`--ct-text: ${overrides.textColor};`);
  if (overrides?.headingColor)   vars.push(`--ct-heading: ${overrides.headingColor};`);
  if (overrides?.accentFgColor)  vars.push(`--ct-accent-fg: ${overrides.accentFgColor};`);
  if (overrides?.borderColor)    vars.push(`--ct-border: ${overrides.borderColor};`);
  if (overrides?.mutedColor)     vars.push(`--ct-muted: ${overrides.mutedColor};`);
  if (overrides?.fontStack)     vars.push(`--ct-font: ${FONTS[overrides.fontStack]};`);

  const radii = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' };
  if (overrides?.borderRadius)  vars.push(`--ct-radius: ${radii[overrides.borderRadius] || '0.5rem'};`);
  
  const borders = { none: '0px', thin: '1px', medium: '2px', thick: '4px' };
  if (overrides?.borderWidth)   vars.push(`--ct-border-width: ${borders[overrides.borderWidth] || '1px'};`);
  
  const shadows = { none: 'none', soft: '0 4px 12px rgba(0,0,0,0.05)', strong: '0 8px 24px rgba(0,0,0,0.15)' };
  if (overrides?.shadowStyle)   vars.push(`--ct-shadow: ${shadows[overrides.shadowStyle] || 'none'};`);

  // Textures
  if (overrides?.texture === 'noise') {
    vars.push(`--ct-texture: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");`);
  } else if (overrides?.texture === 'weave') {
    vars.push(`--ct-texture: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q5 0 10 10 Q15 20 20 10' fill='none' stroke='rgba(0,0,0,0.05)' stroke-width='0.5'/%3E%3C/svg%3E");`);
  } else if (overrides?.texture === 'dots') {
    vars.push(`--ct-texture: url("data:image/svg+xml,%3Csvg width='10' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.05)'/%3E%3C/svg%3E");`);
  } else if (overrides?.texture === 'svg') {
    vars.push(`--ct-texture: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100' stroke='rgba(0,0,0,0.03)' stroke-width='0.5'/%3E%3C/svg%3E");`);
  } else {
    vars.push(`--ct-texture: none;`);
  }

  if (overrides?.buttonShape === 'outline') {
    vars.push(`--ct-btn-bg: transparent; --ct-btn-text: var(--ct-accent); --ct-btn-border: var(--ct-accent);`);
  } else if (overrides?.buttonShape === 'ghost') {
    vars.push(`--ct-btn-bg: transparent; --ct-btn-text: var(--ct-accent); --ct-btn-border: transparent;`);
  } else {
    // solid
    vars.push(`--ct-btn-bg: var(--ct-accent); --ct-btn-text: var(--ct-accent-fg); --ct-btn-border: var(--ct-accent);`);
  }

  if (vars.length > 0) {
    css += `\n:root { ${vars.join(' ')} }`;
  }

  return css;
}
