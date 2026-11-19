import istanbul from 'rollup-plugin-istanbul';
import { versionIntro } from './scripts/build-helpers.mjs';

const plugins = [];
if (process.env.FLOW_COVERAGE === '1') {
  plugins.push(istanbul({
    exclude: ['node_modules/**']
  }));
}

export default {
  input: 'src/Flow.js',
  plugins,
  output: {
    name: 'Flow',
    file: process.env.FLOW_TEST_OUT || 'dist/flow.test.js',
    format: 'umd',
    exports: 'default',
    sourcemap: true,
    intro: versionIntro
  }
};
