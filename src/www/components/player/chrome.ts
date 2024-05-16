import { render, html } from 'lit-html'
import '@vandeurenglenn/lite-elements/icon.js'
import '@material/web/iconbutton/icon-button.js'

class PlayerChrome extends HTMLElement {
  playing = false
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  togglePlay = () => {
    this.playing = !this.playing
    if (this.playing) {
    }
    this.render()
  }

  get template() {
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

  render() {
    render(this.template, this.shadowRoot)
  }
}

customElements.define('player-chrome', PlayerChrome)
