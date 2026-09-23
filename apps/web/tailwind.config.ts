import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border, 214 32% 91%))',
        input: 'hsl(var(--input, 214 32% 91%))',
        ring: 'hsl(var(--ring, 222.2 84% 4.9%))',
        background: 'hsl(var(--background, 0 0% 100%))',
        foreground: 'hsl(var(--foreground, 222.2 84% 4.9%))',
        // Official FIXnGO Design System Tokens
        navy: {
          DEFAULT: '#0C2233',
          dark: '#081722',
          light: '#13354e',
        },
        'signal-orange': {
          DEFAULT: '#C2410C',
          hover: '#9a3412',
          light: '#ffedd5',
        },
        'ocean-blue': {
          DEFAULT: '#0A7BA8',
          hover: '#086388',
          light: '#e0f2fe',
        },
        ground: '#F5F4F0',
        ink: '#13202B',
        slate: {
          DEFAULT: '#4A5763',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#4A5763',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        line: '#E5E2DA',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#C2410C', // Signal Orange as primary action
          foreground: '#ffffff',
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#C2410C',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          DEFAULT: '#0C2233', // Navy
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#0A7BA8', // Ocean Blue
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#F5F4F0',
          foreground: '#4A5763',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#13202B',
        },
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
