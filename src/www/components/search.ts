import '@vandeurenglenn/lite-elements/icon.js'
import '@material/web/iconbutton/icon-button.js'
import '@vandeurenglenn/lite-elements/toggle.js'
import { LiteElement, html } from '@vandeurenglenn/lite'

class PlayerChrome extends LiteElement {
  playing = false

  togglePlay() {
    this.playing = !this.playing
    if (this.playing) {
    }
  }

  render() {
    return html`
      <style>
        :host {
          display: flex;
          height: 72px;
          width: 100%;
          padding: 12px 24px;
          box-sizing: border-box;
          align-items: center;
        }
      </style>
      <md-icon-button><custom-icon icon="fast_rewind"></custom-icon></md-icon-button>
      <md-icon-button><custom-icon icon="skip_previous"></custom-icon></md-icon-button>
      <md-icon-button @click=${this.togglePlay}>
        <custom-icon icon=${this.playing ? 'pause' : 'play'}></custom-icon>
      </md-icon-button>
      <md-icon-button><custom-icon icon="skip_next"></custom-icon></md-icon-button>
      <md-icon-button><custom-icon icon="fast_forward"></custom-icon></md-icon-button>
    `
  }
}

customElements.define('player-chrome', PlayerChrome)
