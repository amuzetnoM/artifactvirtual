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
          label: 'Journal',
          items: [
            { label: 'A1W18D1', slug: 'journal/A1W18D1.md' }
          ],
        },
        {
          label: 'Manifesto',
          items: [
            { label: 'Preface', slug: 'manifesto/_preface' },
            { label: 'Principles', slug: 'manifesto/_index' },
            { label: 'Singularity I', slug: 'manifesto/singularity_1' },
            { label: 'Regeneration', slug: 'manifesto/regeneration' },
            { label: 'Commands', slug: 'manifesto/commands' },
            { label: 'New Section', slug: 'manifesto/new-section' },
            { label: 'Additional Section', slug: 'manifesto/additional-section' },
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
