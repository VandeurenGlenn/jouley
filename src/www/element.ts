import { html, render } from 'lit-html'
import { css, CSSResult } from 'lit'

declare interface ElementConstructor {
  styles?: CSSResult[] | CSSStyleSheet[]
}

export type StyleList = CSSResult[] | CSSStyleSheet[]

class BaseElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.requestRender()
    const klass = customElements.get(this.localName) as ElementConstructor
    this.shadowRoot.adoptedStyleSheets = klass.styles.map((style) => style.styleSheet ?? style)
  }

  static styles: CSSResult[] | CSSStyleSheet[] = []

  render() {
    return html`<slot></slot>`
  }

  requestRender() {
    render(this.render(), this.shadowRoot)
  }
}
export { html, BaseElement }
