// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import MindElixir from '@zikojs/remark-plugin-mind-elixir'

// https://astro.build/config
export default defineConfig({
	markdown:{
		remarkPlugins:[MindElixir]
	},
	integrations: [
		starlight({
			title: 'My Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
