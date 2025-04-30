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
          items: [
            // Corrected slug to point within docs collection
            { label: 'A1W18D1', slug: 'journal/A1W18D1' }
          ],
        },
        {
          label: 'Manifesto',
          items: [
            // Corrected slugs to point within docs collection
            { label: 'Preface', slug: 'manifesto/_preface' },
            { label: 'Principles', slug: 'manifesto/_index' },
            { label: 'Singularity I', slug: 'manifesto/singularity_1' }
          ],
        },
        {
          label: 'Research Papers',
          items: [
            // Corrected slugs to point within docs collection
            { label: 'Robotics', slug: 'researchpapers/robotics' },
            { label: 'Uncertainty', slug: 'researchpapers/uncertainty' }
          ],
        },
        {
          label: 'Reference',
          // Assuming 'reference' content will live directly under docs/
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
