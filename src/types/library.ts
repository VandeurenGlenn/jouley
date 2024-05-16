import type { IAudioMetadata } from 'music-metadata'

export type LibraryTrack = {
  metadata: IAudioMetadata['common']
  duration: IAudioMetadata['format']['duration']
  path: string // the path to file in library
}

export type LibraryTracks = {
  [id: string]: LibraryTrack
}

export type Library = {
  tracks: LibraryTracks
}
