/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vince: {
          dark: '#121214',
          panel: '#18181b',
          card: '#222225',
          border: '#2e2e33',
          accent: '#e6e8ec', // Trắng đục
          emerald: '#10b981',
          gold: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
