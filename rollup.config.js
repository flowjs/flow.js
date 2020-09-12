import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
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
        input: 'src/flow.js',
        plugins,
        output: {
            name: 'Flow',
            file: pkg.browser,
            sourcemap: true,
            format: 'umd',
	},
    },
    {
        input: 'src/flow.js',
        plugins: plugins.concat([terser()]),
        output: {
            name: 'Flow',
            banner: `/*! ${pkg.name} ${pkg.version} */\n`,
            file: pkg.browser.replace(/js$/, 'min.js'),
            sourcemap: true,
            format: 'esm',
	},
    }

];
