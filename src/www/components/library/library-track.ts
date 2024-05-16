import { LiteElement, css, customElement, html, property } from '@vandeurenglenn/lite'
import { TemplateResult } from 'lit-html'
import { LibraryTrack } from '../../../types/library.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'

@customElement('library-track')
export class LibraryTrackElement extends LiteElement {
  @property() accessor track: LibraryTrack
  @property({ reflect: true, attribute: 'track-id' }) accessor trackId: string

  connectedCallback() {
    this.addEventListener('contextmenu', (ev) => {
      const top = ev.offsetY
      const left = ev.offsetX
      this.getBoundingClientRect().top
    })
  }
  static styles = [
    css`
      :host {
        display: flex;
        padding: 12px 12px;
        width: 100%;
        box-sizing: border-box;
        height: 56px;
        align-items: center;
        max-width: 1470px;
        overflow: hidden;

        border-bottom: 1px solid var(--md-sys-color-outline);
      }

      .title,
      .artist,
      .album,
      .middle {
        overflow: hidden;

        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .title {
        justify-content: space-between;

        max-width: 40%;
        width: 100%;
      }

      .middle {
        margin-left: 24px;
        overflow: hidden;
        align-items: center;
        max-width: 30%;
        width: 100%;
      }
      .artist,
      .album {
        max-width: 50%;
        width: 100%;
      }

      p {
        margin: 0;
      }

      .mobile {
        width: 100%;
      }

      img {
        height: 32px;
        width: 32px;
        margin-right: 12px;
      }
    `
  ]
  _renderTrack() {
    let duration = this.track.duration
    if (duration) duration = new Date(this.track.duration * 1000)
    return html`
      <img src=${this.track.albumArt ? this.track.albumArt.thumb : 'placeholder'} />
      <p class="title" title=${this.track.metadata.title}>${this.track.metadata.title}</p>
      <flex-row class="middle">
        <p class="artist">${this.track.metadata.artist}</p>
        <p class="album">${this.track.metadata.album}</p>
      </flex-row>

      <span class="duration">${duration.getMinutes()}:${duration.getSeconds()} </span>

      <flex-it></flex-it>
      <custom-toggle-button togglers='["thumb_up", "filled_thumb_up"]'> </custom-toggle-button>
    `
  }

  render(): TemplateResult<1> {
    return html` ${this.track ? this._renderTrack() : ''} `
  }
}
