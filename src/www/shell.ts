import '@vandeurenglenn/lit-elements/pages.js'
import '@vandeurenglenn/lit-elements/selector.js'
import './views/library.js'
import './components/player/chrome.js'
import icons from './icons.js'
// @ts-ignore
import style from './shell.css' assert { type: 'css' }
// @ts-ignore
import template from './shell.html' assert { type: 'html' }
import { StyleList, BaseElement, html } from './element.js'
import { property } from './decorators/decorators.js'

class JouleyShell extends BaseElement {
  constructor() {
    super()
  }
  static styles: StyleList = [style]

  @property({ type: Boolean, reflect: true, attribute: 'drawer-open' })
  accessor drawerOpen: boolean = false

  render() {
    return html`
      ${icons}
      <md-icon-button @click=${() => (this.drawerOpen = !this.drawerOpen)} class="drawer-menu-button">
        <custom-icon icon=${this.drawerOpen ? 'menu_open' : 'menu'}></custom-icon>
      </md-icon-button>
      <aside>
        <custom-selector> </custom-selector>
      </aside>
      <main>
        <header>
          <search-component></search-component>
        </header>
        <custom-pages>
          <library-view></library-view>
        </custom-pages>
        <player-chrome></player-chrome>
      </main>
    `
  }
}

customElements.define('jouley-shell', JouleyShell)
