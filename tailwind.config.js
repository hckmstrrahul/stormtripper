/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        inter: ['Inter var', 'sans-serif']
      },
      colors: {
        lumored: {
          50: '#fdf4f3',
          100: '#fce6e4',
          200: '#fad2ce',
          300: '#f5b3ac',
          400: '#ed877c',
          500: '#e26254',
          600: '#ce4334',
          700: '#ad3528',
          800: '#8f2f25',
          900: '#772d25'
        },
        lumobeige: {
          50: '#FAF4F0',
          100: '#eeeae8',
          200: '#d9d2ce',
          300: '#c1b5ae',
          400: '#a79790',
          500: '#94817a',
          600: '#87736e',
          700: '#6f5f5d',
          800: '#5a5453',
          900: '#484747'
        }
      },
      padding: {
        '1/3': '33.333333%'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
