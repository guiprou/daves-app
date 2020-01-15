import { LitElement } from 'lit-element';

class PageViewElement extends LitElement {
  static get properties() {
    return { active: { type: Boolean } };
  }

  shouldUpdate() {
    return this.active;
  }
}

export default PageViewElement;
