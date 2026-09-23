import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://crisepermanente.fr',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});
