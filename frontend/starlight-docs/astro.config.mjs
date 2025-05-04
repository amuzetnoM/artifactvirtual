// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeBlack from 'starlight-theme-black';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightThemeBlack({
          navLinks: [
            {
              label: 'Docs',
              link: '/getting-started',
            },
          ],
          footerText:
            'Built & designed by <a href="https://twitter.com/shadcn">shadcn</a>. Ported to Astro Starlight by <a href="https://github.com/adrian-ub">Adrián UB</a>. The source code is available on <a href="https://github.com/adrian-ub/starlight-theme-black">GitHub</a>.',
        }),
      ],
      title: 'ArtifactVirtual Docs',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', slug: 'guides/getting-started' },
            { label: 'Core Components', slug: 'guides/core-components' },
            { label: 'Troubleshooting', slug: 'guides/troubleshooting' },
            { label: 'Resources & FAQ', slug: 'guides/resources' },
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
