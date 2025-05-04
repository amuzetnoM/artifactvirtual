module.exports = {
  content: [
    './src/**/*.{astro,js,jsx,ts,tsx,md,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
