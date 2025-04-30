// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://amuzetnoM.github.io/artifactvirtual',
  output: 'static',
  integrations: [
    starlight({
      title: 'ArtifactVirtual Docs',
      defaultTheme: 'dark',
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
            { label: 'A1W18D1', slug: 'journal/A1W18D1' }
          ],
        },
        {
          label: 'Manifesto',
          items: [
            { label: 'Preface', slug: 'manifesto/_preface' },
            { label: 'Principles', slug: 'manifesto/_index' },
            { label: 'Singularity I', slug: 'manifesto/singularity_1' }
          ],
        },
        {
          label: 'Research Papers',
          items: [
            { label: 'Robotics', slug: 'researchpapers/robotics' },
            { label: 'Uncertainty', slug: 'researchpapers/uncertainty' }
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
