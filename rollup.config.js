import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import materialSymbols from 'rollup-plugin-material-symbols'
import { cssModules } from 'rollup-plugin-css-modules'
import { htmlModules } from 'rollup-plugin-html-modules'
import { cp, opendir, unlink, readdir } from 'fs/promises'
import { join } from 'path'
import { globby } from 'globby'

try {
  await opendir('./app/www/themes/default')
} catch {
  await cp(
    './node_modules/@vandeurenglenn/lite-elements/exports/themes/default',
    './app/www/themes/default',
    {
      recursive: true
    }
  )
}

let originalInput

const include = (input) => ({
  name: 'include',
  buildStart: async (options) => {
    if (!originalInput) originalInput = options.input
    if (typeof input === 'string') input = [input]
    options.input = [...originalInput, ...(await globby(input))]
  }
})

const clean = async (dir) => {
  return {
    name: 'clean', // this name will show up in warnings and errors
    generateBundle: async () => {
      try {
        const files = await readdir(dir)
        const removals = []
        for (const file of files) {
          if (
            file.endsWith('.js') &&
            !file.includes('sw.js') &&
            !file.includes('workbox') &&
            !file.includes('preload') &&
            !file.includes('app')
          )
            removals.push(unlink(join(dir, file)))
        }
        return Promise.all(removals)
      } catch {
        return
      }
    }
  }
}

export default [
  {
    input: ['src/www/shell.ts'],
    output: {
      dir: 'app/www',
      format: 'es'
    },
    plugins: [
      clean('app/www'),
      htmlModules(),
      resolve(),
      cssModules(),
      typescript({
        compilerOptions: {
          outDir: 'app/www'
        }
      }),
      include('./src/www/views'),
      materialSymbols({ placeholderPrefix: 'symbol' })
    ]
  },
  {
    input: ['src/app.ts'],
    external: ['electron'],
    output: {
      dir: 'app',
      format: 'es'
    },
    plugins: [typescript(), resolve()]
  },
  {
    input: './node_modules/@leofcoin/storage/exports/store.js',
    output: {
      dir: 'app',
      format: 'es'
    }
  },
  {
    input: ['src/preload.ts'],
    external: ['electron'],
    output: {
      dir: 'app',
      format: 'cjs'
    },
    plugins: [typescript(), resolve()]
  }
]
