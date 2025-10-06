// Design System Tokens for Clapo

export const colors = {
  // Brand colors
  primary: {
    50: '#f0f4ff',
    100: '#e5edff',
    200: '#d1dfff',
    300: '#b3c8ff',
    400: '#85a3ff',
    500: '#6E54FF', // Main brand color
    600: '#5b42d6',
    700: '#4c35b3',
    800: '#3d2a91',
    900: '#2a1d64',
  },

  // Grayscale for dark theme
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0a0a',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background variants
  background: {
    primary: '#000000',
    secondary: '#0a0a0a',
    tertiary: '#1a1a1a',
    card: '#1f1f1f',
    elevated: '#2a2a2a',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#a3a3a3',
    muted: '#737373',
    inverse: '#000000',
  },

  // Border colors
  border: {
    default: '#404040',
    muted: '#262626',
    focus: '#6E54FF',
  }
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
} as const;

export const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Custom shadows for the app
  card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  glow: '0 0 0 1px rgb(110 84 255 / 0.1), 0 4px 6px -1px rgb(110 84 255 / 0.1)',
} as const;

export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  easings: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  }
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component-specific design tokens
export const components = {
  button: {
    heights: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
    },

    padding: {
      sm: `${spacing.sm} ${spacing.md}`,
      md: `${spacing.md} ${spacing.lg}`,
      lg: `${spacing.lg} ${spacing.xl}`,
    }
  },

  input: {
    height: '2.75rem', // 44px
    padding: `${spacing.md} ${spacing.lg}`,
  },

  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    border: `1px solid ${colors.border.default}`,
  }
} as const;

// Utility functions for design tokens
export const getColor = (colorPath: string) => {
  const paths = colorPath.split('.');
  let current: any = colors;

  for (const path of paths) {
    current = current[path];
    if (!current) return undefined;
  }

  return current;
};

export const getSpacing = (size: keyof typeof spacing) => spacing[size];

export const getFontSize = (size: keyof typeof typography.fontSizes) => typography.fontSizes[size];

export const getFontWeight = (weight: keyof typeof typography.fontWeights) => typography.fontWeights[weight];

// CSS custom properties generator for use in components
export const cssVars = {
  '--color-primary': colors.primary[500],
  '--color-background': colors.background.primary,
  '--color-card': colors.background.card,
  '--color-text': colors.text.primary,
  '--color-text-muted': colors.text.muted,
  '--color-border': colors.border.default,
  '--spacing-md': spacing.md,
  '--spacing-lg': spacing.lg,
  '--border-radius-lg': borderRadius.lg,
} as const;