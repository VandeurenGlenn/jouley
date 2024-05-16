import Events from 'events'
import type { PathLike } from 'fs'
import { readdir, open } from 'fs/promises'
import { watch, stat } from 'fs'
import { join, parse } from 'path'

export default class Watcher extends Events {
  path: string
  includes: string[]
  bouncer = {}

  constructor(path, includes) {
    super()
    this.path = path
    this.includes = includes

    this.initWatcher()
  }

  async #handlePossiblePaste(dir) {
    const path = join(this.path, dir)
    if (this.bouncer[dir]) clearTimeout(this.bouncer[dir])

    this.bouncer[dir] = setTimeout(async () => {
      const inDir = (await readdir(path, { recursive: true })).filter((path) =>
        this.includes.includes(parse(path).ext)
      )
      for (const _path of inDir) {
        const fullPath = join(path, _path)
        console.log({ fullPath })

        const fd = await open(fullPath)
        this.emit('change', { type: 'add', path: fullPath, fd, filename: _path })
      }
    }, 250)
  }

  async initWatcher() {
    const inDir = (await readdir(this.path, { recursive: true })).filter((path) =>
      this.includes.includes(parse(path).ext)
    )
    const watcher = watch(this.path)
    for (const path of inDir) {
      const fullPath = join(this.path, path)
      console.log({ fullPath })

      const fd = await open(fullPath)
      this.emit('change', { type: 'add', path: fullPath, fd, filename: path })
    }

    watcher.on('change', async (type, path: string) => {
      const fullPath = join(this.path, path)
      if (!parse(path).ext) return this.#handlePossiblePaste(path)

      if (type === 'rename' || type === 'change') {
        try {
          const fd = await open(fullPath)
          this.emit('change', { type: 'add', path: fullPath, filename: path, fd })
        } catch (error) {
          console.log({ error })

          this.emit('change', { type: 'remove', path: fullPath })
        }
      }
    })
  }
}
