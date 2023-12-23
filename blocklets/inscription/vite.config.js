import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import { createBlockletPlugin } from 'vite-plugin-blocklet';
import WindiCSS from 'vite-plugin-windicss';
import svgr from 'vite-plugin-svgr';

// docs: https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    optimizeDeps: {
      force: true, // use monorepo need this
    },
    server: {
      fs: {
        strict: false, // monorepo and pnpm required
      },
    },
    plugins: [react({}), createBlockletPlugin(), WindiCSS(), svgr()],
  };
});
