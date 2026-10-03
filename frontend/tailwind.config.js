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
          navy: '#0f172a',
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          'blue-subtle': '#eff6ff',
          'blue-border': '#bfdbfe',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card': '0 4px 20px -2px rgb(0 0 0 / 0.05), 0 2px 6px -1px rgb(0 0 0 / 0.03)',
        'card-hover': '0 14px 34px -4px rgb(37 99 235 / 0.12), 0 4px 12px -2px rgb(0 0 0 / 0.04)',
        'glow-blue': '0 0 25px -4px rgb(37 99 235 / 0.35)',
        'glow-emerald': '0 0 25px -4px rgb(16 185 129 / 0.35)',
      },
      transitionTimingFunction: {
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-natural': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
