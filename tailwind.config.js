/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme colors
        dark: {
          bg: '#1A1A1A',
          surface: '#222222',
          card: '#2a2a2a',
          border: '#333333',
        },
        light: {
          bg: '#f9fafb',
          surface: '#ffffff',
          card: '#f3f4f6',
          border: '#e5e7eb',
        },
        // Brand colors
        brand: {
          primary: {
            DEFAULT: '#EF4444',
            dark: '#DC2626',
            darker: '#B91C1C',
            light: '#FCA5A5',
            lighter: '#FEE2E2',
          },
          secondary: {
            DEFAULT: '#3B82F6',
            dark: '#2563EB',
            darker: '#1D4ED8',
            light: '#93C5FD',
            lighter: '#DBEAFE',
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #EF4444, #DC2626)',
        'gradient-secondary': 'linear-gradient(to right, #3B82F6, #2563EB)',
        'gradient-dark': 'linear-gradient(to bottom, rgba(26, 26, 26, 0.8), rgba(26, 26, 26, 0.4))',
        'gradient-light': 'linear-gradient(to bottom, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 0.4))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
}; 