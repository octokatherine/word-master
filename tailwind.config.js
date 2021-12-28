module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(231, 16%, 92%)',
        primary: '#323549',
        'n-green': 'hsl(110, 33%, 50%)',
        'n-gray': 'hsl(231, 12%, 45%)',
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
