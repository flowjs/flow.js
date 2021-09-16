import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import istanbul from 'rollup-plugin-istanbul';
import pkg from './package.json';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import { terser } from "rollup-plugin-terser";

const babelPlugin = babel({
  babelHelpers: 'bundled'
});

const stripPlugin = strip({
  functions: ['console.(log|debug)', 'debug', 'alert']
});

const plugins = [
  resolve(),
  commonjs(),
  replace({
    "<%= version %>": `'${pkg.version}'`,
    delimiters: ["'", "'"]
  })
];

export default [{
  input: 'src/Flow.js',
  plugins,
  output: {
    name: 'Flow',
    file: pkg.browser,
    sourcemap: true,
    format: 'umd'
  }
}, {
  input: 'src/Flow.js',
  plugins: plugins.concat(stripPlugin, terser()),
  output: {
    name: 'Flow',
    file: pkg.browser.replace(/js$/, 'min.js'),
    sourcemap: true,
    format: 'umd'
  }
}, {
  input: 'src/Flow.js',
  plugins: plugins.concat(babelPlugin, stripPlugin, terser()),
  output: {
    name: 'Flow',
    banner: `/*! ${pkg.name} ${pkg.version} */\n`,
    file: pkg.browser.replace(/js$/, 'compat.min.js'),
    sourcemap: true,
    format: 'umd'
  }
}, {
  input: 'src/Flow.js',
  plugins: plugins.concat(babelPlugin, istanbul({ exclude: ['node_modules/**/*.js'] })),
  output: {
    name: 'Flow',
    banner: `/*! ${pkg.name} ${pkg.version} */\n`,
    file: pkg.browser.replace(/js$/, 'cov.js'),
    sourcemap: true,
    format: 'umd'
  }
}];
