import { html, render } from 'lit-html';

class LibraryView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  render() {
    render(this.template, this.shadowRoot);
  }

  get template() {
    return html` <p>lib</p> `;
  }
}
customElements.define('library-view', LibraryView);
