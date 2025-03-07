import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';


export default defineConfig({
  integrations: [
    react(), 
    vue({ appEntrypoint: './vue/setup' }), 
    svelte()
  ],
  devToolbar: {
    enabled: false,
  },
  srcDir: './www',
})