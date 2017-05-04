
import jscc    from 'rollup-plugin-jscc'
import buble   from 'rollup-plugin-buble'
import cleanup from 'rollup-plugin-cleanup'
import types   from './src/nodetypes'

const external = ['fs', 'path']

export default {
  entry: 'src/htmlparser.js',
  plugins: [
    jscc({ values: { _T: types } }),
    buble(),
    cleanup()
  ],
  external: external,
  targets: [
    { dest: 'dist/riot-parser.js', format: 'cjs' },
    { dest: 'dist/riot-parser.es.js', format: 'es' }
  ]
}
