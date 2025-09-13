import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy shadcn/ui colors (keeping for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // FieldKit Design System Colors
        canvas: '#FAFAF7',
        surface: '#F6F3EA', 
        sidebar: {
          DEFAULT: '#7F8F73',
          600: '#6E7E63',
          300: '#98A78C',
        },
        fk: {
          primary: {
            DEFAULT: '#2E7D32',
            600: '#1E6A25',
            200: '#E2F2E4',
          },
          accent: {
            wheat: '#E6B422',
            sky: '#3D8BF2',
          },
          earth: '#8D6E63',
          text: {
            DEFAULT: '#213127',
            muted: '#6B7767',
          },
          border: '#E4E1D7',
          success: '#2E7D32',
          info: '#1976D2',
          warning: '#C77700',
          danger: '#C62828',
          stress: '#E65100',
          up: '#1B8A3A',
          down: '#C62828',
          neutral: '#8D6E63',
        },

        // Keep existing colors for backward compatibility
        'crops-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'crops-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'sage': {
          50: '#f6f7f6',
          100: '#e1e5e1',
          200: '#c4ccc4',
          300: '#9eac9e',
          400: '#7c9885',
          500: '#5a7a5f',
          600: '#45604a',
          700: '#374d3b',
          800: '#2e3f32',
          900: '#1f2a22',
          950: '#0f1510',
        },
        'cream': {
          50: '#fefffe',
          100: '#faf8f5',
          200: '#f5f2ed',
          300: '#ede8e0',
          400: '#e1ddd3',
          500: '#d1cbc0',
          600: '#b8b0a3',
          700: '#9a9086',
          800: '#7a7169',
          900: '#5d5751',
          950: '#403e3a',
        },
        'earth': {
          50: '#faf8f3',
          100: '#f0ebe0',
          200: '#e2d5c1',
          300: '#d1bc9c',
          400: '#c2a677',
          500: '#b8985e',
          600: '#a8844f',
          700: '#8b6d44',
          800: '#71583d',
          900: '#5c4835',
          950: '#3d2f23',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // FieldKit specific radii
        card: '16px',
        control: '10px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '2xl': ['2.0rem', { lineHeight: '1.2' }], // H1 - page titles
        'xl': ['1.5rem', { lineHeight: '1.2' }],   // H2 - section titles
        'lg': ['1.25rem', { lineHeight: '1.2' }], // H3 - card titles
        'base': ['1.0rem', { lineHeight: '1.5' }], // body
        'sm': ['0.875rem', { lineHeight: '1.5' }], // labels, meta
        'xs': ['0.75rem', { lineHeight: '1.3' }],  // badges
      },
      fontWeight: {
        'bold': '700',    // headings
        'semibold': '600', // card titles, buttons
        'normal': '400',   // body
      },
      boxShadow: {
        // Legacy shadows
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 38px -10px rgba(0, 0, 0, 0.08), 0 10px 20px -15px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(122, 152, 133, 0.15)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // FieldKit design system shadows
        'fk-sm': '0 1px 2px rgba(0,0,0,0.06)',
        'fk-md': '0 4px 12px rgba(0,0,0,0.10)',
        'fk-lg': '0 8px 24px rgba(0,0,0,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        // FieldKit spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
        '1': '4px',   // 0.25rem
        '2': '8px',   // 0.5rem  
        '3': '12px',  // 0.75rem
        '4': '16px',  // 1rem
        '5': '20px',  // 1.25rem
        '6': '24px',  // 1.5rem
        '8': '32px',  // 2rem
        '10': '40px', // 2.5rem
        '12': '48px', // 3rem
        '16': '64px', // 4rem
      },
      transitionDuration: {
        'micro': '120ms',
        'standard': '180ms',
        'large': '240ms',
      },
      transitionTimingFunction: {
        'fk': 'cubic-bezier(0.2, 0.0, 0.2, 1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // FieldKit animations
        'hover-lift': 'hover-lift 180ms cubic-bezier(0.2, 0.0, 0.2, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
        'hover-lift': {
          '0%': { transform: 'translateY(0px)', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' },
          '100%': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.10)' },
        },
      },
    },
  },
  plugins: [],
}
export default config