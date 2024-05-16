export class TemplateIf extends HTMLElement {
  #if

  get if() {
    return this.#if
  }

  set if(value) {
    if (value) {
    } else this.shadowRoot.innerHTML = ''
    this.#if = value
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
}
