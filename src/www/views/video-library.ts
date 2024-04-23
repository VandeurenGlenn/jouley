import { html, render } from 'lit-html'

class VideoLibraryView extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }
  render() {
    render(this.template, this.shadowRoot)
  }

  get template() {
    return html` <p>lib</p> `
  }
}
customElements.define('video-library-view', VideoLibraryView)
