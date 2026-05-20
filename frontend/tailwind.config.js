/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"Inter"', 'sans-serif'],
      },
      colors: {
        // Cool blue-slate neutrals
        ink: {
          50:  '#F0F4FA',
          100: '#DDE6F4',
          200: '#BDD0EB',
          300: '#94B0D8',
          400: '#6B8DBF',
          500: '#4A6E9F',
          600: '#344E7A',
          700: '#233759',
          800: '#152439',
          900: '#0D1B2E',
        },
        // Indigo-blue accent
        sage: {
          50:  '#EEF2FF',
          100: '#DCE4FE',
          200: '#C0CCFC',
          300: '#96ACFA',
          400: '#7090F0',
          500: '#4F6EE8',
          600: '#3D59D0',
          700: '#2D45B4',
          800: '#223498',
          900: '#182680',
        },
        amber: {
          50:  '#FDF8EE',
          100: '#FAE9C4',
          200: '#F5D48E',
          300: '#EEB94A',
          400: '#E09B12',
          500: '#B87C0C',
          600: '#8B5D08',
          700: '#5E3F05',
          800: '#362403',
          900: '#170F01',
        },
        rose: {
          50:  '#FEF0EF',
          100: '#FBCFCC',
          200: '#F7A09B',
          300: '#F06860',
          400: '#E43028',
          500: '#BA1E17',
          600: '#8C1510',
          700: '#5F0E0B',
          800: '#360806',
          900: '#160302',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontWeight: {
        300: '300', 400: '400', 500: '500',
        600: '600', 700: '700', 800: '800',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':  'fadeIn 0.3s ease forwards',
        'count-up': 'countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' },                                 to: { opacity: '1' } },
        countUp:  { from: { opacity: '0', transform: 'translateY(6px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(13,27,46,0.06), 0 4px 16px rgba(13,27,46,0.04)',
        'card-lg': '0 2px 8px rgba(13,27,46,0.08), 0 16px 48px rgba(13,27,46,0.06)',
        'inset':   'inset 0 1px 3px rgba(13,27,46,0.08)',
      },
    },
  },
  plugins: [],
}
