
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel'

export default {
    input: 'src/index.js',
    output: [
        {
            file: './lib/index.js',
            format: 'iife',
            name: 'monitor',
        },
        {
            file: './lib/index.esm.js',
            format: 'esm'
        },
        {
            file: './lib/index.umd.js',
            format: 'umd',
            name: 'monitor_umd',
        },
    ],
    watch: {
        exclude: 'node_modules/**',
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
          babelHelpers: 'bundled',
          exclude: 'node_modules/**',
          extensions: ['.js'],
        }),
    ],
}