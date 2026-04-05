import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://RipZhouDi.github.io',  // <-- 加上这行，非常重要！
  integrations: [mdx(), sitemap()],
});