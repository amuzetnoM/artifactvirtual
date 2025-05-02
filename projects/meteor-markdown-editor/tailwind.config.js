/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Define custom theme colors using CSS variables
        // Light Theme (Default)
        background: 'var(--color-background)', // Use CSS variable for background
        foreground: 'var(--color-foreground)', // Use CSS variable for main text
        muted: 'var(--color-muted)',           // Use CSS variable for subtle elements/text
        'muted-foreground': 'var(--color-muted-foreground)',
        card: 'var(--color-card)',             // Card backgrounds
        'card-foreground': 'var(--color-card-foreground)',
        border: 'var(--color-border)',         // Borders
        primary: 'var(--color-primary)',       // Primary interactive elements
        'primary-foreground': 'var(--color-primary-foreground)',
        // ... add other semantic colors as needed (secondary, accent, destructive, etc.)
      },
      typography: (theme) => ({
        // Adjust prose defaults to use CSS variables
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-lead': theme('colors.muted-foreground'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted-foreground'),
            '--tw-prose-bullets': theme('colors.muted'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted-foreground'),
            '--tw-prose-code': theme('colors.foreground'), // Code text color
            '--tw-prose-pre-code': theme('colors.foreground'), // Code block text color
            '--tw-prose-pre-bg': theme('colors.muted'), // Code block background
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
            // Remove dark mode variants from here, handle via theme switching
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ... other plugins
  ],
};