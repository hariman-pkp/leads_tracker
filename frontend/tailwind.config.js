/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          800: '#1e3a5f',
          900: '#132847',
          950: '#0d1b31',
        },
        // Semantic theme tokens — map to CSS variables
        apex: {
          bg:       'var(--apex-bg)',
          surface:  'var(--apex-surface)',
          card:     'var(--apex-card)',
          border:   'var(--apex-border)',
          border2:  'var(--apex-border-2)',
          text:     'var(--apex-text)',
          muted:    'var(--apex-text-muted)',
          faint:    'var(--apex-text-faint)',
          input:    'var(--apex-input-bg)',
        },
      },
      transitionProperty: {
        theme: 'background-color, border-color, color',
      },
    },
  },
  plugins: [],
}
