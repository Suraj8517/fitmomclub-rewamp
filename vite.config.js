import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

<<<<<<< HEAD
export default defineConfig({ plugins: [react(), tailwindcss()] });
=======
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // long-cacheable vendor chunks; three.js is only reached through dynamic imports so it loads on demand
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/three/')) return 'three';
          if (id.includes('/gsap/')) return 'gsap';
          if (id.includes('/react') || id.includes('/scheduler/')) return 'react';
        },
      },
    },
  },
});
>>>>>>> master
