/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#E83E8C',
          'pink-hover': '#D62F7C',
          'pink-light': '#FFF0F6',
          'pink-subtle': '#FFE4EE',
          orange: '#FF8A3D',
          'orange-hover': '#F07524',
          'orange-light': '#FFF4ED',
          dark: '#1F2937',
          muted: '#6B7280',
          border: '#E5E7EB',
          surface: '#FFFFFF',
          bg: '#FAFAFB',
        }
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(232, 62, 140, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(232, 62, 140, 0.12), 0 4px 10px -2px rgba(255, 138, 61, 0.08)',
        'glow-pink': '0 0 25px rgba(232, 62, 140, 0.35)',
        'glow-orange': '0 0 25px rgba(255, 138, 61, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
