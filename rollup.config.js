import { terser } from 'rollup-plugin-terser';
import { versionIntro } from './scripts/build-helpers.mjs';

const input = 'src/Flow.js';
const outDir = process.env.FLOW_DIST || 'dist';

export default [
  {
    input,
    
    output: {
      file: `${outDir}/flow.esm.js`,
      format: 'es',
      sourcemap: true,
      intro: versionIntro
    }
  },
  {
    input,
    
    output: {
      file: `${outDir}/flow.js`,
      format: 'umd',
      name: 'Flow',
      exports: 'default',
      sourcemap: true,
      intro: versionIntro
    }
  },
  {
    input,
    plugins: [terser()],
    output: {
      file: `${outDir}/flow.min.js`,
      format: 'umd',
      name: 'Flow',
      exports: 'default',
      sourcemap: true,
      intro: versionIntro
    }
  },
  {
    input,
    
    output: {
      file: `${outDir}/flow.cjs`,
      format: 'cjs',
      exports: 'default',
      intro: versionIntro
    }
  }
];
