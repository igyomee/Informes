import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0b0b',
        brand: '#facc15',
        line: '#d4d4d4'
      },
      boxShadow: {
        panel: '0 12px 36px rgba(23, 32, 38, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config;
