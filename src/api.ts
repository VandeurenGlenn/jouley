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
import getAlbumArt from './album-art.js'
import mime from 'mime-types'
import { notify } from './app.js'

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

const getMusicInfo = async (musicBuffer, path) => {
  let fileType = await fileTypeFromBuffer(musicBuffer)
  if (!fileType) fileType = { ext: parse(path).ext.replace('.', ''), mime: mime.lookup(path) }
  const metadata = await mm.parseBuffer(musicBuffer, fileType ? fileType.mime : mime.lookup(path))
  return { metadata, fileType }
}

const addToMusicLibrary = async (fd, path, filename, removeOriginal) => {
  notify('library-track-addeding', {
    path,
    filename
  })
  const buffer = await fd.readFile()

  const info = await getMusicInfo(buffer, path)
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

  const sanitizeName = (name) =>
    name.replaceAll('"', "'").replaceAll('feat.', 'featuring ').replaceAll('.', '')

  const fileLibraryPath = join(parsed.dir, `${sanitizeName(parsed.name)}.${info.fileType.ext}`)
    .split(sep)
    .join('/')

  try {
    await writeFile(fileLibraryPath, buffer)
  } catch (error) {
    console.error(error)
  }

  const hasher = await createHash('sha256')
  hasher.update(buffer)
  const hash = hasher.digest('hex')
  await fd.close()

  if (!(await libraryStorage.has('tracks'))) await libraryStorage.put('tracks', JSON.stringify({}))
  const lib = JSON.parse(decoder.decode(await libraryStorage.get('tracks')))
  // lib.
  // if (!info.metadata.common.picture) {
  //   const albumArt = await getAlbumArt(info.metadata.common.artist, info.metadata.common.album)
  //   info.metadata.common.picture = [albumArt]
  // }
  if (lib[hash]) console.warn(`duplicate file found ${path}, ignoring for now`)
  else {
    lib[hash] = {
      path: fileLibraryPath,
      metadata: info.metadata.common,
      duration: info.metadata.format.duration,
      albumArt: await getAlbumArt(info.metadata.common.artist, info.metadata.common.album)
    }
    await libraryStorage.put('tracks', JSON.stringify(lib))
    if (removeOriginal) await unlink(path)
  }

  notify('library-track-added', {
    path: fileLibraryPath,
    metadata: info.metadata.common,
    duration: info.metadata.format.duration,
    albumArt: await getAlbumArt(info.metadata.common.artist, info.metadata.common.album)
  })
}

const removeFromMusicLibrary = (path) => {}

const setupWatcher = async (path, removeOriginal) => {
  watchers.push(path)
  const watcher = new Watcher(path, extensions.music)

  // todo remove dir
  watcher.on('change', async ({ type, path, fd, filename }) => {
    try {
      if (type === 'add') await addToMusicLibrary(fd, path, filename, removeOriginal)
    } catch (error) {
      console.log(error)

      console.log(`ignoring: ${path}, possibly removed already`)
    }

    if (fd) await fd.close()

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
