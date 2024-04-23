import LeofcoinStorage from '@leofcoin/storage'
import { ipcMain } from 'electron'
import { join, sep, parse } from 'path'
import { watch } from 'fs'
import { opendir, open, mkdir, writeFile, unlink } from 'fs/promises'
import os from 'os'
import { fileTypeFromBuffer } from 'file-type'
import * as mm from 'music-metadata'
import { createHash } from 'node:crypto'

import { win32 } from 'path'
import { Settings, WatchFolderOptions } from './types/settings.js'
import extensions from './extensions.js'
import Watcher from './watcher.js'

const { username, homedir } = os.userInfo()

const decoder = new TextDecoder()
const encoder = new TextEncoder()

const posixify = (path: string) => (path.includes(win32.sep) ? path.split(win32.sep).join('/') : path)

const settingsStorage = new LeofcoinStorage('settings', 'jouley')
await settingsStorage.init()

const defaultLibraryLocation = posixify(join(homedir, 'jouley'))

const libraryLocation = async () => {
  if (await settingsStorage.has('libraryLocation'))
    return decoder.decode(await settingsStorage.get('libraryLocation'))
  return defaultLibraryLocation
}

const libraryStorage = new LeofcoinStorage('library', await libraryLocation(), { homedir: false })
await libraryStorage.init()

const musicLibraryLocation = join(await libraryLocation(), 'library', 'music')

try {
  const musicFd = await opendir(musicLibraryLocation)
  await musicFd.close()
} catch {
  await mkdir(musicLibraryLocation, { recursive: true })
}

const watchers = []

const _watchers = {}

const getMusicInfo = async (musicBuffer) => {
  const fileType = await fileTypeFromBuffer(musicBuffer)
  const metadata = await mm.parseBuffer(musicBuffer, fileType.mime)
  return { metadata, fileType }
}

const addToMusicLibrary = async (fd, path, filename, removeOriginal) => {
  const buffer = await fd.readFile()
  const info = await getMusicInfo(buffer)
  // let tagInfo
  // if (info.metadata.format.tagTypes.length === 1) {
  //   tagInfo = info.metadata.native[info.metadata.format.tagTypes[0]]
  // } else {
  //   tagInfo = info.metadata.format.tagTypes.reduce((set, tagType) => {
  //     if (set.length < info.metadata.native[tagType].length) {
  //       set = info.metadata.native[tagType]
  //     }
  //     return set
  //   }, [])
  // }
  const newPath = [musicLibraryLocation]
  if (info.metadata.common.artist) newPath.push(info.metadata.common.artist)
  if (info.metadata.common.album) newPath.push(info.metadata.common.album)
  if (info.metadata.common.track.no !== null && info.metadata.common.title) {
    const numberedFile =
      String(info.metadata.common.track.no).length > 1
        ? info.metadata.common.track.no
        : `0${info.metadata.common.track.no}`
    newPath.push(`${numberedFile} ${info.metadata.common.title}`)
  } else if (info.metadata.common.title) {
    newPath.push(info.metadata.common.title)
  } else if (info.metadata.common.track.no !== null) {
    const numberedFile =
      String(info.metadata.common.track.no).length > 1
        ? info.metadata.common.track.no
        : `0${info.metadata.common.track.no}`
    newPath.push(`${numberedFile} ${filename}`)
  } else {
    newPath.push(filename)
  }

  let parsed = parse(newPath.join(sep))
  // whenever an extension is missing we set it according the filetype result.
  if (!parsed.ext) {
    newPath[newPath.length - 1] = `${newPath[newPath.length - 1]}.${info.fileType.ext}`
    parsed = parse(newPath.join(sep))
  }

  try {
    await opendir(parsed.dir.split(sep).join('/'))
  } catch {
    await mkdir(parsed.dir, { recursive: true })
  }

  const fileLibraryPath = join(parsed.dir, `${parsed.name}.${info.fileType.ext}`)
    .split(sep)
    .join('/')
    .replaceAll('"', "'")

  try {
    await writeFile(fileLibraryPath, buffer)
  } catch (error) {
    console.error(error)
  }
  await fd.close()

  const hasher = await createHash('sha1')
  hasher.push(buffer)
  const hash = hasher.digest('hex')

  if (!(await libraryStorage.has('music'))) await libraryStorage.put('music', JSON.stringify({}))
  const lib = JSON.parse(decoder.decode(await libraryStorage.get('music')))
  // lib.
  if (lib[hash]) console.warn(`duplicate file found ${path}, ignoring for now`)
  else {
    lib[hash] = {
      path: fileLibraryPath,
      metadata: info.metadata.common
    }
    await libraryStorage.put('music', JSON.stringify(lib))
    if (removeOriginal) await unlink(path)
  }
}

const removeFromMusicLibrary = (path) => {}

const setupWatcher = async (path, removeOriginal) => {
  watchers.push(path)
  const watcher = new Watcher(path, extensions.music)

  watcher.on('change', ({ type, path, fd, filename }) => {
    try {
      if (type === 'add') addToMusicLibrary(fd, path, filename, removeOriginal)
    } catch {
      console.log(`ignoring: ${path}, possibly removed already`)
    }
    // do we really need remove?
    // if (type === 'remove') console.log({ path })
  })

  _watchers[path] = watcher
}

const removeOriginal = true
try {
  const folders = JSON.parse(decoder.decode(await settingsStorage.get('watchFolders')))
  for (const folder of folders) {
    setupWatcher(folder, removeOriginal)
  }
} catch {
  // ignore
}

export const settings = async (): Promise<Settings> => {
  const keys = ['libraryLocation', 'watchFolders']
  const result = {}
  let values
  try {
    values = await settingsStorage.many('get', keys)
  } catch (error) {
    await settingsStorage.many('put', {
      libraryLocation: await libraryLocation(),
      watchFolders: encoder.encode(JSON.stringify([join(homedir, 'Music')]))
    })
    values = await settingsStorage.many('get', keys)
  }
  for (const key in values) {
    let decoded = decoder.decode(values[key])
    try {
      decoded = JSON.parse(decoded)
      console.log(decoded)
    } catch {}
    result[keys[key]] = decoded
  }

  for (const path of result['watchFolders']) {
    if (!watchers.includes(path)) setupWatcher(path, removeOriginal)
  }

  return result as Settings
}
ipcMain.handle('settings', settings)

ipcMain.handle('setLibraryLocation', (value) => settingsStorage.put('libraryLocation', value))

ipcMain.handle('setWatchFolders', (value) => settingsStorage.put('watchFolders', value))

ipcMain.handle('getLibrary', () => libraryStorage.many('get', ['tracks', 'playlists', 'albums']))

ipcMain.handle('getLibraryTracks', () => libraryStorage.get('tracks'))

ipcMain.handle('getLibraryPlaylists', () => libraryStorage.get('playlists'))

ipcMain.handle('getLibraryAlbums', () => libraryStorage.get('albums'))
