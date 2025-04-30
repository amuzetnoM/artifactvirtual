// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://amuzetnoM.github.io/artifactvirtual',
  output: 'static',
  integrations: [
    starlight({
      title: 'ArtifactVirtual Docs',
      defaultLocale: 'en', // Added defaultLocale for clarity
      locales: { // Added locales object
        en: {
          label: 'English',
        },
      },
      customCss: [
        './src/styles/custom.css', // Added custom CSS reference
      ],
      head: [ // Added head configuration for favicon
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon.svg',
            type: 'image/svg+xml',
          },
        },
      ],
      // Removed invalid defaultTheme key
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/amuzetnoM/artifactvirtual',
        },
      ],
      sidebar: [
        {
          label: 'Journal',
          autogenerate: { directory: 'journal' }
        },
        {
          label: 'Manifesto',
          // Use autogenerate for Manifesto section
          autogenerate: { directory: 'manifesto' }
        },
        {
          label: 'Research Papers',
          // Use autogenerate for Research Papers section
          autogenerate: { directory: 'researchpapers' }
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
