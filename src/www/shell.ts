import '@vandeurenglenn/lite-elements/theme.js'
import '@vandeurenglenn/lite-elements/pages.js'
import '@vandeurenglenn/lite-elements/selector.js'
import './components/player/chrome.js'
import icons from './icons.js'
import '@vandeurenglenn/lite-elements/icon-button.js'
import '@vandeurenglenn/lite-elements/drawer-item.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@vandeurenglenn/flex-elements/it.js'

// @ts-ignore
import style from './shell.css' assert { type: 'css' }
import { LiteElement, property, html, query } from '@vandeurenglenn/lite'

class JouleyShell extends LiteElement {
  static styles = [style]

  @property({ type: Boolean, reflect: true, attribute: 'drawer-open' })
  accessor drawerOpen: boolean = false

  @query('custom-pages')
  accessor _pages

  @property() accessor selected

  async _selected({ detail }) {
    this.selected = detail
    if (!customElements.get(`${detail}-view`)) await import(`./${detail}.js`)
    this._pages.select(detail)
  }

  async _subRouteSelected({ detail }) {
    if (!customElements.get(`${detail}-view`)) await import(`./${detail}.js`)
    this._pages.select(detail)
  }

  _renderMusicLibrarySubRail() {
    return html`
      <custom-drawer-item route="music-library-songs">
        <custom-icon icon="music_note"></custom-icon>
        <flex-it></flex-it>
        <custom-typography size="medium">songs</custom-typography>
      </custom-drawer-item>

      <custom-drawer-item route="music-library-playlists">
        <custom-icon icon="featured_playlist"></custom-icon>
        <flex-it></flex-it>
        <custom-typography size="medium">playlists</custom-typography>
      </custom-drawer-item>

      <custom-drawer-item route="music-library-recents">
        <custom-icon icon="fiber_new"></custom-icon>
        <flex-it></flex-it>
        <custom-typography size="medium">recently added</custom-typography>
      </custom-drawer-item>
    `
  }

  _renderVideoLibrarySubRail() {
    return html`
      <custom-drawer-item route="video-library-songs">
        <custom-icon icon="videocam"></custom-icon>
        <flex-it></flex-it>
        <custom-typography size="medium">videos</custom-typography>
      </custom-drawer-item>

      <custom-drawer-item route="video-library-playlists">
        <custom-icon icon="featured_playlist"></custom-icon>
        <flex-it></flex-it>
        <custom-typography size="medium">playlists</custom-typography>
      </custom-drawer-item>

      <custom-drawer-item route="video-library-recents">
        <custom-icon icon="fiber_new"></custom-icon>
        <flex-it></flex-it>
        <custom-typography size="medium">recently added</custom-typography>
      </custom-drawer-item>
    `
  }

  render() {
    return html`
      ${icons}
      <custom-theme load-symbols="false"></custom-theme>
      <aside>
        <custom-selector class="rail" attr-for-selected="route" @selected=${this._selected.bind(this)}>
          <custom-drawer-item route="music-library">
            <custom-icon icon="library_music"></custom-icon>
            <flex-it></flex-it>
            <custom-typography size="medium">music</custom-typography>
          </custom-drawer-item>

          <custom-drawer-item route="video-library">
            <custom-icon icon="video_library"></custom-icon>
            <flex-it></flex-it>
            <custom-typography size="medium">video</custom-typography>
          </custom-drawer-item>

          <flex-it></flex-it>

          <custom-drawer-item route="settings">
            <custom-icon icon="settings"></custom-icon>
            <flex-it></flex-it>
            <custom-typography size="medium">settings</custom-typography>
          </custom-drawer-item>
        </custom-selector>

        <custom-selector attr-for-selected="route" @selected=${this._subRouteSelected.bind(this)}>
          <!--<custom-drawer-item route="music-library-dashboard">
            <custom-icon icon="dashboard"></custom-icon>
            <flex-it></flex-it>
            <custom-typography size="medium">dashboard</custom-typography>
          </custom-drawer-item>-->

          ${this.selected === 'music-library'
            ? this._renderMusicLibrarySubRail()
            : this.selected === 'video-library'
            ? this._renderVideoLibrarySubRail()
            : ''}
        </custom-selector>
      </aside>
      <main>
        <header>
          <custom-toggle-button
            @click=${() => (this.drawerOpen = !this.drawerOpen)}
            .togglers=${['menu', 'menu_open']}
          ></custom-toggle-button>
          <search-component></search-component>
          <notification-component></notification-component>
        </header>
        <custom-pages attr-for-selected="route">
          <settings-view route="settings"></settings-view>
          <music-library-view route="music-library"></music-library-view>
          <video-library-view route="video-library"></video-library-view>
        </custom-pages>
        <player-chrome></player-chrome>
      </main>
    `
  }
}

customElements.define('jouley-shell', JouleyShell)
