import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        cream: '#fafafa',
        'cream-dark': '#f4f4f5',

        ink: '#09090b',
        'ink-2': '#27272a',
        'ink-3': '#71717a',

        stone: '#d4d4d8',
        'stone-light': '#e4e4e7',

        accent: '#2563eb',

        green: '#16a34a',
        'green-light': '#dcfce7',
      },

      fontFamily: {
        sans: ['var(--font-sans)'],
      },

      boxShadow: {
        soft: '0 10px 40px rgba(0, 0, 0, 0.08)',
      },

      borderRadius: {
        xl2: '2rem',
      },
    },
  },

  plugins: [],
};

export default config;