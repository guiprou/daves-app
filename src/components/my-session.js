import { LitElement, html } from '@polymer/lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import {
  navigate
} from '../actions/app.js';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

class MySession extends connect(store)(LitElement) {
  _render(props) {

  this._boot();

    return html`
      ${SharedStyles}
      <style></style>
    `;
  }

  static get properties() { return {
    loginPage: String
  }}

  constructor() {
    super();
    this.loginPage = './login.html';
  }

  _firstRendered() {
  }

  _stateChanged(state) {
  }

  _boot() {
    var user = sessionStorage.getItem('user');
    if (this._shouldHandleSsoTokenRedirect()) {
      this._handleSsoTokenRedirect();
    } else {
      if (user == null) {
        this._redirectToLoginPage();
      }
    }
  }

  _shouldHandleSsoTokenRedirect() {
    return window.location.hash.startsWith("#auth=");
  }

  _handleSsoTokenRedirect() {
    var me = this;
    if (this._shouldHandleSsoTokenRedirect()) {
      var queryDict = {};
      if (location.hash != "") {
        var hash = location.hash.substring(1); // remove #
        hash.split("&").forEach(function (item) {
          var keyvalue = item.split("=");
          queryDict[me._decode(keyvalue[0])] = me._decode(keyvalue[1]);
        });
      }
      this._storeToken(queryDict.auth);

      window.history.replaceState(undefined, document.title, this._locationWithoutHash());

      //go again.
      this._boot.bind(this)();
    }
  }

  _decode(val) {
    return decodeURIComponent((val + '').replace(/\+/g, '%20'));
  }

  _storeToken(token) {
    sessionStorage.setItem('token', token);
  }

  _redirectToLoginPage() {
    // var redirectUrl = this.loginPage  ;
    // window.location.href = redirectUrl;
    // store.dispatch(navigate(window.decodeURIComponent(redirectUrl)))

  }

  _locationWithoutHash() {
    return window.location.href.split("#")[0];
  }

}

/* Register the new element with the browser */
window.customElements.define('my-session', MySession);
