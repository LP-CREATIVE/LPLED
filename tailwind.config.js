/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#059669', dark: '#065f46', light: '#34d399' },
        amber: {
          50:  '#fef1ec',
          100: '#fedcd0',
          200: '#fdbba5',
          300: '#fb9779',
          400: '#fa8066',
          500: '#f75f3f',
          600: '#e04829',
          700: '#b83820',
          800: '#8f2b18',
          900: '#661f10',
        },
      },
    },
  },
  plugins: [],
};
