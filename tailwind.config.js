/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mars: {
          bg: '#f3f2f2',
          surface: '#eae9e9',
          text: '#201e1d',
          divider: 'rgba(32, 30, 29, 0.25)',
          red: '#ec3013',
          'red-hover': '#dd2b0f',
          'red-active': '#ae1800',
          'red-light': '#fff2ef',
          'red-dark': '#7c1405',
          dark: '#2d2b2b',
          'dark-surface': '#201e1d',
          neutral: {
            100: '#f8f4f4',
            200: '#eae7e7',
            300: '#d7d3d3',
            400: '#bab6b6',
            500: '#9b9797',
            600: '#7d7979',
            700: '#605d5d',
            800: '#444141',
            900: '#2d2b2b',
          }
        }
      },
      fontFamily: {
        heading: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['Archivo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
      }
    },
  },
  plugins: [],
}
