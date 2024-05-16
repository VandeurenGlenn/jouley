import { LiteElement, customElement, html, css, property } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/typography.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@vandeurenglenn/flex-elements/container.js'

@customElement('settings-view')
export class SettingsView extends LiteElement {
  @property()
  accessor libraryLocation

  @property()
  accessor watchFolders

  static styles = [
    css`
      :host {
        display: flex;
        justify-content: center;
      }

      flex-row {
        width: 100%;
      }
    `
  ]

  async connectedCallback() {
    const settings = await api.settings()
    console.log({ settings })

    for (const setting of Object.keys(settings)) {
      this[setting] = settings[setting]
    }
  }

  render() {
    return html`
      <flex-container>
        <h4><custom-typography>General</custom-typography></h4>

        <flex-row center>
          <label>Library location</label>
          <flex-it></flex-it>
          <input type="text" value=${this.libraryLocation} />
        </flex-row>

        <flex-row center>
          <label>Move detected music to the music library folder</label>
          <flex-it></flex-it>
          <custom-toggle-button togglers='["check_box", "check_box_unchecked"]'></custom-toggle-button>
        </flex-row>

        <flex-row center>
          <label>Move detected video to the video library folder</label>
          <flex-it></flex-it>
          <custom-toggle-button togglers='["check_box", "check_box_unchecked"]'></custom-toggle-button>
        </flex-row>

        <flex-row center
          ><h4><custom-typography>Watch Folders</custom-typography></h4>
          <flex-it></flex-it><custom-icon-button icon="add"></custom-icon-button
        ></flex-row>

        ${this.watchFolders ? this.watchFolders.map((folder) => html` ${folder} `) : ''}
      </flex-container>
    `
  }
}
