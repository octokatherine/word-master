const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      xxs: '321px',
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        background: 'hsl(231, 16%, 92%)',
        primary: 'hsl(231, 16%, 25%)',
        'background-dark': 'hsl(231, 16%, 25%)',
        'primary-dark': 'hsl(231, 16%, 92%)',
        'n-green': 'hsl(110, 33%, 50%)',
        'n-gray': 'hsl(231, 16%, 45%)',
      },
    },
    neumorphismSize: {
      xs: '0.05em',
      sm: '0.1em',
      default: '0.2em',
      lg: '0.4em',
      xl: '0.8em',
    },
  },
  plugins: [require('tailwindcss-neumorphism')],
}
