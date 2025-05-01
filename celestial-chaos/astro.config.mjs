import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://amuzetnoM.github.io/artifactvirtual',
  base: '/', 
  output: 'static',
  integrations: [
    starlight({
      title: 'ARTIFACT VIRTUAL',
      customCss: [
        './src/styles/custom.css',
      ],
      defaultLocale: 'root', 
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
      social: {
        github: 'https://github.com/amuzetnoM/artifactvirtual',
      },
      sidebar: [
        {
          label: 'Journal',
          autogenerate: { 
            directory: 'journal',
            collapsed: false
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
      pagination: true,
      // Configure theme through custom component instead of unrecognized options
      components: {
        Head: './src/components/CustomHead.astro',
      }
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
});
