/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aapke Brand Guidelines ke mutabiq
        'brand': '#EA5A5A',         // 1. Primary (Action)
        'white': '#FFFFFF',         // 
        'text-dark': '#333333',     // 2. Text (Dark Gray)
        'text-medium': '#555555',   //    Body Text (Medium Gray)
        'bg-light': '#FAFAFA',      //    Background (Light Gray)
        'border-light': '#EEEEEE',  //    Borders / Dividers
        // Utility Colors
        'success': '#28a745',
        'error': '#DC3545',
        'warning': '#FFC107',
      },
      fontFamily: {
        // Poppins font ko default 'sans' banayein
        sans: ['var(--font-poppins)', ...fontFamily.sans],
      },
      // Typography rules
      h1: {
        fontSize: '2.5rem', // 40px
        fontWeight: '700',
        color: '#333333',
      },
      h2: {
        fontSize: '2rem', // 32px
        fontWeight: '600',
        color: '#333333',
      },
      h3: {
        fontSize: '1.5rem', // 24px
        fontWeight: '600',
        color: '#333333',
      },
      body: {
        fontSize: '1rem', // 16px
        fontWeight: '400',
        color: '#555555',
      },
    },
  },
  plugins: [],
};

