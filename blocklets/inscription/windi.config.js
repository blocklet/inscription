import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  extract: {
    include: ['**/*.{jsx,js,css,html}'],
    exclude: ['node_modules', '.git', '.next', 'api', 'dist', 'build'],
  },
  plugins: [
    // eslint-disable-next-line global-require
    require('windicss/plugin/line-clamp'),
    // ...
  ],
});
