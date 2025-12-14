import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nature-inspired green palette
        nature: {
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
          950: '#052e16',
        },
        // Earthy warm tones
        earth: {
          50: '#fdfaf5',
          100: '#f9f1e3',
          200: '#f3e2c7',
          300: '#e9cda0',
          400: '#ddb374',
          500: '#c99a4d',
          600: '#b17f3b',
          700: '#936433',
          800: '#78502f',
          900: '#63432b',
          950: '#362115',
        },
        // Soft sage green
        sage: {
          50: '#f6f7f4',
          100: '#e3e7dd',
          200: '#c8d1be',
          300: '#a6b398',
          400: '#859575',
          500: '#687859',
          600: '#525f46',
          700: '#414b39',
          800: '#363e30',
          900: '#2f352a',
          950: '#181c15',
        },
        // Heritage gold
        heritage: {
          50: '#fefaec',
          100: '#fcf1ca',
          200: '#f9e291',
          300: '#f5cd57',
          400: '#f2b830',
          500: '#e99c18',
          600: '#ce7712',
          700: '#ab5512',
          800: '#8b4316',
          900: '#733815',
          950: '#421c07',
        },
        // Keep backwards compatibility
        primary: {
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
        accent: {
          50: '#fefaec',
          100: '#fcf1ca',
          200: '#f9e291',
          300: '#f5cd57',
          400: '#f2b830',
          500: '#e99c18',
          600: '#ce7712',
          700: '#ab5512',
        }
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
