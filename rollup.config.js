import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import istanbul from 'rollup-plugin-istanbul';
import pkg from './package.json';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

let plugins = [
    resolve(),
    commonjs(),
    replace({
        "<%= version %>": `'${pkg.version}'`,
        delimiters: ["'", "'"]
    }),

    babel({ babelHelpers: 'bundled' })
];

export default [
    {
        input: 'src/Flow.js',
        plugins,
        output: {
            name: 'Flow',
            file: pkg.browser,
            sourcemap: true,
            format: 'umd',
	},
    },
    {
        input: 'src/Flow.js',
        plugins: plugins.concat([terser()]),
        output: {
            name: 'Flow',
            banner: `/*! ${pkg.name} ${pkg.version} */\n`,
            file: pkg.browser.replace(/js$/, 'min.js'),
            sourcemap: true,
            format: 'esm',
	},
    },
    {
        input: 'src/Flow.js',
        plugins: plugins.concat([istanbul({exclude: ['node_modules/**/*.js']})]),
        output: {
            name: 'Flow',
            banner: `/*! ${pkg.name} ${pkg.version} */\n`,
            file: pkg.browser.replace(/js$/, 'cov.js'),
            sourcemap: true,
            format: 'umd',
	},
    }

];
