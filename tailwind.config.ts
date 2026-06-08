import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f3ee',
        'cream-dark': '#ede9e1',
        ink: '#1a1916',
        'ink-2': '#3d3b36',
        'ink-3': '#7a7870',
        stone: '#d4d0c8',
        'stone-light': '#e8e5dd',
        accent: '#c9582a',
        green: '#2a5c3f',
        'green-light': '#e8f0eb',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
      },
      boxShadow: {
        soft: '0 8px 32px rgba(26,25,22,0.12)',
      },
      borderRadius: {
        xl2: '2rem',
      },
    },
  },
  plugins: [],
};

export default config;