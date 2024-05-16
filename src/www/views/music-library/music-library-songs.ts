import { LiteElement, customElement, html, css, property } from '@vandeurenglenn/lite'
import '../../components/library/library-track.js'
import { LibraryTrack } from '../../../types/library.js'
import { StyleList } from '@vandeurenglenn/lite/element'

@customElement('music-library-songs-view')
export class MusicLibrarySongsView extends LiteElement {
  @property() accessor tracks

  async connectedCallback() {
    const decoder = new TextDecoder()
    this.tracks = JSON.parse(decoder.decode(await api.getLibraryTracks()))
  }

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;

        align-items: center;
        overflow-y: auto;
      }

      .container {
        max-width: 1470px;
        width: 100%;
        padding: 24px;
        box-sizing: border-box;
      }
    `
  ]

  render() {
    return html`
      <div class="container">
        ${this.tracks
          ? Object.entries(this.tracks).map(
              ([id, track]) =>
                html`<library-track .track=${track as LibraryTrack} .trackId=${id}></library-track>`
            )
          : ''}
      </div>
    `
  }
}
