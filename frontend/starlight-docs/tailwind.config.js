module.exports = {
  content: [
    './src/**/*.{astro,js,jsx,ts,tsx,md,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FFD700', // Gold
          dark: '#B8860B',    // Dark gold
        },
        brandblack: {
          DEFAULT: '#18181B', // Deep black
        },
      },
      fontFamily: {
        sans: ['Atkinson', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
