import nodeResolve from '@rollup/plugin-node-resolve';

/**
 * babel: 兼容插件
 * rollup/plugin-typescript: 兼容ts
 */
const buildMainOptions = {
  input: 'src/main.js',
  output: {
    dir: 'dist/esm',
    format: 'esm',
    chunkFileNames: '[name].[hash].js',
    entryFileNames: '[name].[hash].js',
  }
}

const buildIndexOptions = {
  input: 'src/index.js',
  output: {
    dir: 'dist/cjs',
    format: 'cjs',
    manualChunks: {
      "lodash-es": ['lodash-es'],
    }
  },
  plugins: [
    nodeResolve(),
  ]
}

export default [buildMainOptions, buildIndexOptions]
