/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fad9c1',
          300: '#f7c19c',
          400: '#f3a575',
          500: '#d35400',
          600: '#b84800',
          700: '#9d3d00',
          800: '#823200',
          900: '#672800',
        },
        secondary: {
          50: '#fefcf9',
          100: '#fdf9f3',
          200: '#fbf3e7',
          300: '#f9eddb',
          400: '#f7e9d3',
          500: '#f5e6cc',
          600: '#e6d1b3',
          700: '#d7bc9a',
          800: '#c8a781',
          900: '#b99268',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
