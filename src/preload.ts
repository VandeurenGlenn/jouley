import { contextBridge, ipcRenderer } from 'electron'
import LittlePubSub from '@vandeurenglenn/little-pubsub'
// in verbose
globalThis.pubsub = globalThis.pubsub || new LittlePubSub(true)
import { settings } from './api.js'

ipcRenderer.on('library-track-added', function (evt, message) {
  console.log(message) // Returns: {'SAVED': 'File Saved'}
})

ipcRenderer.on('library-track-adding', function (evt, message) {
  console.log(message) // Returns: {'SAVED': 'File Saved'}
})

const _versions = {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // we can also expose variables, not just functions
}

const _api = {
  setLibraryLocation: (...args) => ipcRenderer.invoke('setLibraryLocation', args),
  setWatchFolders: (...args) => ipcRenderer.invoke('setWatchFolders', args),
  getLibrary: () => ipcRenderer.invoke('getLibrary'),
  getLibraryTracks: () => ipcRenderer.invoke('getLibraryTracks'),
  getLibraryPlaylists: () => ipcRenderer.invoke('getLibraryPlaylists'),
  getLibraryAlbums: () => ipcRenderer.invoke('getLibraryAlbums'),
  settings: () => ipcRenderer.invoke('settings')
}

declare global {
  var pubsub: LittlePubSub
  var api: typeof _api
  var versions: typeof _versions
}

contextBridge.exposeInMainWorld('versions', _versions)
contextBridge.exposeInMainWorld('api', _api)

ipcRenderer.on('track', (track) => {
  pubsub.publish('track', track)
})
