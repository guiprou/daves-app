import { html } from 'lit-element';
import PageViewElement from './page-view-element';
import { SharedStyles } from './shared-styles';

class MyView404 extends PageViewElement {
  render() {
    return html`
      ${SharedStyles}
      <section>
        <h2>Oops! You hit a 404</h2>
        <p>The page you're looking for doesn't seem to exist. Head back
           <a href="/">home</a> and try again?
        </p>
      </section>
    `;
  }
}

window.customElements.define('my-view404', MyView404);
