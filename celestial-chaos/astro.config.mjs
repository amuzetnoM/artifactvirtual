import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://amuzetnoM.github.io/artifactvirtual',
  base: '/', // Add explicit base path
  output: 'static',
  integrations: [
    starlight({
      title: 'ARTIFACT VIRTUAL',
      customCss: [
        './src/styles/custom.css',
      ],
      defaultLocale: 'root', // Changed from 'en' to 'root'
      locales: {
        root: {
          label: 'English',
          lang: 'en', // Specify language code
        },
      },
      social: [
        { 
          label: 'GitHub',
          href: 'https://github.com/amuzetnoM/artifactvirtual',
          icon: 'github'
        }
      ],
      sidebar: [
        {
          label: 'Journal',
          autogenerate: { 
            directory: 'journal',
            collapsed: false // Ensure expanded by default
          }
        },
        {
          label: 'Manifesto',
          autogenerate: { 
            directory: 'manifesto',
            collapsed: false
          }
        },
        {
          label: 'Research Papers',
          autogenerate: { 
            directory: 'researchpapers',
            collapsed: false
          }
        },
        {
          label: 'Reference',
          autogenerate: { 
            directory: 'reference',
            collapsed: false
          }
        },
      ],
      // Add pagination setting to ensure we show prev/next links
      pagination: true,
    }),
  ],
});
