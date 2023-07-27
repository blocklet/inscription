import { defineConfig } from 'vite';

import fs from 'fs';
import react from '@vitejs/plugin-react';
import { createBlockletPlugin } from 'vite-plugin-blocklet';
import WindiCSS from 'vite-plugin-windicss';
import svgr from 'vite-plugin-svgr';

// must add  index.html.* to .gitignore
const openGraphPlugin = () => {
  return {
    name: 'html-transform',
    async transformIndexHtml(html) {
      // write to file for open graph test
      await fs.writeFileSync('index.html.local', html);
      return html;
    },
  };
};

// docs: https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  return {
    optimizeDeps: {
      force: true, // use monorepo need this
    },
    server: {
      fs: {
        strict: false, // monorepo and pnpm required
      },
    },
    plugins: [
      react({}),
      createBlockletPlugin({
        disableNodePolyfills: false,
      }),
      WindiCSS(),
      svgr(),
      mode === 'development' && openGraphPlugin(),
    ],
  };
});
