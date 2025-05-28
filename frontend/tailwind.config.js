/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'client': {
          500: '#3B82F6',
          600: '#2563EB',
        },
        'professional': {
          500: '#10B981',
          600: '#059669',
        },
        'superadmin': {
          500: '#6B7280',
          600: '#4B5563',
        },
      },
    },
  },
  plugins: [],
} 