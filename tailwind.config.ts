import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172026',
        brand: '#0f766e',
        line: '#d9e2e7'
      },
      boxShadow: {
        panel: '0 12px 36px rgba(23, 32, 38, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config;
