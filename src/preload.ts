import { contextBridge, ipcRenderer } from 'electron'
import LittlePubSub from '@vandeurenglenn/little-pubsub'
// in verbose
globalThis.pubsub = globalThis.pubsub || new LittlePubSub(true)
console.log('p')

declare global {
  var pubsub: LittlePubSub
}

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('api', {
  hasLib: () => ipcRenderer.invoke('hasLib'),
  loadLib: () => ipcRenderer.invoke('loadLib'),
  importLib: (type) => ipcRenderer.invoke('importLib', type)
})

ipcRenderer.on('track', (track) => {
  pubsub.publish('track', track)
})
