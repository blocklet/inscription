// rollup.config.js
// import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import glob from 'glob';

export default {
  input: glob.sync('lib/cjs/*.js'),
  output: [
    {
      dir: 'lib/esm',
      format: 'es',
    },
  ],
  plugins: [
    // resolve(),
    commonjs({
      transformMixedEsModules: true,
      esmExternals: (id) => {
        return ['@ocap/util', 'ethers'].includes(id); // fixed no default bug
      },
    }),
    json(),
    copy({
      targets: [{ src: 'lib/cjs/*.json', dest: 'lib/esm' }],
    }),
  ],
};
