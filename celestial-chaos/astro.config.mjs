// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://amuzetnoM.github.io/artifactvirtual',
  output: 'static',
  integrations: [
    starlight({
      title: 'ArtifactVirtual Docs',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/amuzetnoM/artifactvirtual',
        },
      ],
      sidebar: [
        {
          label: 'Genesis',
          items: [
            { label: 'A1W18D1', slug: 'journal/a1w18d1' }
          ],
        },
        {
          label: 'Manifesto',
          items: [
            { label: 'Preface', slug: 'manifesto/preface' },
            { label: 'Principles', slug: 'manifesto/index' },
            { label: 'Singularity I', slug: 'manifesto/singularity_1' },
            { label: 'Regeneration', slug: 'manifesto/regeneration' },
            { label: 'Commands', slug: 'manifesto/commands' },
            { label: 'New Section', slug: 'manifesto/new-section' },
          ],
        },
        {
          label: 'Research Papers',
          items: [
            { label: 'Robotics', slug: 'researchpapers/robotics' },
            { label: 'Uncertainty', slug: 'researchpapers/uncertainty' },
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
