import { LitElement, html } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../store';
import { SharedStyles } from './shared-styles';

class MySession extends connect(store)(LitElement) {
  static get properties() {
    return { loginPage: String };
  }

  constructor() {
    super();
    this.loginPage = './login.html';
  }

  _boot() {
    const user = sessionStorage.getItem('user');
    if (this._shouldHandleSsoTokenRedirect()) {
      this._handleSsoTokenRedirect();
    } else if (!user) {
      this._redirectToLoginPage();
    }
  }

  _shouldHandleSsoTokenRedirect() {
    return window.location.hash.startsWith("#auth=");
  }

  _handleSsoTokenRedirect() {
    if (this._shouldHandleSsoTokenRedirect()) {
      const queryDict = {};
      if (location.hash) {
        const hash = location.hash.substring(1); // remove #
        hash.split('&').forEach((item) => {
          const keyvalue = item.split('=');
          queryDict[this._decode(keyvalue[0])] = this._decode(keyvalue[1]);
        });
      }
      this._storeToken(queryDict.auth);

      window.history.replaceState(null, document.title, this._locationWithoutHash());
      this._boot.bind(this)();
    }
  }

  _decode(val) {
    return decodeURIComponent((`${val} `).replace(/\+/g, '%20'));
  }

  _storeToken(token) {
    sessionStorage.setItem('token', token);
  }

  _redirectToLoginPage() {

  }

  _locationWithoutHash() {
    return window.location.href.split('#')[0];
  }

  render() {
    this._boot();
  }
}

/* Register the new element with the browser */
window.customElements.define('my-session', MySession);
