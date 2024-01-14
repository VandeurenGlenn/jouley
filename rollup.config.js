import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import materialSymbols from 'rollup-plugin-material-symbols'
import { cssModules } from 'rollup-plugin-css-modules'
import { htmlModules } from 'rollup-plugin-html-modules'

export default [
  {
    input: ['src/app.ts', 'src/preload.ts'],
    external: ['electron'],
    output: {
      dir: 'app',
      format: 'cjs'
    },
    plugins: [typescript(), resolve()]
  },
  {
    input: ['src/www/shell.ts'],
    output: {
      dir: 'app',
      format: 'es'
    },
    plugins: [
      htmlModules(),
      resolve(),
      cssModules(),
      typescript(),
      materialSymbols({ placeholderPrefix: 'symbol' })
    ]
  }
]
