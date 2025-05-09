/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          light: '#3f8e9b',
          DEFAULT: '#2d6b76',
          dark: '#1a4851',
        },
        background: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        text: {
          light: '#1a1a1a',
          dark: '#ffffff',
        },
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
} 