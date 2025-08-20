/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93bbfd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        fish: {
          musky: '#8B4513',
          pike: '#228B22',
          smallmouth: '#4B0082',
          largemouth: '#006400',
          walleye: '#FFD700',
          perch: '#FFA500',
          bluegill: '#4169E1',
          catfish: '#696969',
          trout: '#FF69B4',
          salmon: '#FA8072',
          other: '#800080'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}