export type WatchFolderOptions = {
  ignore: string[]
  moveToLibrary: boolean
  deleteAfterImport: boolean
}

export type Settings = {
  libraryLocation: string
  watchFolders: { [path: string]: WatchFolderOptions }[]
}
