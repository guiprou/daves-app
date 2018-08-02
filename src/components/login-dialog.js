import { LitElement, html } from '@polymer/lit-element';
import {repeat} from "lit-html/lib/repeat"
import { connect } from 'pwa-helpers/connect-mixin.js';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-tooltip/paper-tooltip.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { login } from '../actions/login.js';

import loginReducer from '../reducers/login-reducer.js';
store.addReducers({
  loginReducer
});

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

class LoginDialog extends connect(store)(LitElement) {
  _render(props) {

    return html`
      ${SharedStyles}
      <style>
        :host {
          display: block;
          height: 100%;
          display: block;

          --app-primary-color: #4285f4;
          --app-secondary-color: #323232;
          --app-dark-text-color: var(--app-secondary-color);
          --app-light-text-color: #ffffff;
          --app-section-even-color: #f7f7f7;
          --app-section-odd-color: white;

          --app-header-background-color: white;
          --app-header-text-color: var(--app-dark-text-color);
          --app-header-selected-color: var(--app-primary-color);

          --app-drawer-background-color: var(--app-secondary-color);
          --app-drawer-text-color: var(--app-light-text-color);
          --app-drawer-selected-color: #78909C;
        }

        #dialog {
          padding: 15px;
        }

        person-item {
          padding: 20px 20px 0 0;
        }

        paper-input {
          min-width: 280px;
        }

        paper-dialog {
          padding: 15px;
          border-radius: 5px;
        }

        .dialog-title {
          margin: -15px;
          padding: 24px 39px;
          background-color: var(--app-secondary-color);
          color: white;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }

        p {
          padding: 24px 24px 0 24px;
          font-family: "font-roboto", sans-serif;
        }
      </style>

      <div id='container'>
      <paper-dialog id='loginDialog' with-backdrop no-cancel-on-outside-click no-cancel-on-esc-key>
        <h2 class='dialog-title'>LOGIN</h2>
        <paper-input label='User Name' value='' on-value-changed='${(e) => { this._setName(e.detail.value) }}'></paper-input>
        <paper-input label='Password' type="password" value='' on-value-changed='${(e) => { this._setPassword(e.detail.value) }}'></paper-input>
        <div class="buttons">
          <paper-button autofocus on-click='${(e) => { store.dispatch(login(props.name, props.password)) }}'>Login</paper-button>
        </div>
      </paper-dialog>
      </div>
    `;
  }

  static get properties() { return {
    name: String,
    password: String
  }}

  constructor() {
    super();
    this.name = '';
    this.password = '';
  }

  // This is called every time something is updated in the store.
  _stateChanged(state) {
    if (this.user != state.loginReducer.user && Object.keys(state.loginReducer.user).length !== 0) {
      this.dispatchEvent(new CustomEvent('logged-change', {detail: {logged: true}}));
      this._closeLogin();
    }
  }

  _setName(name) {
    this.name = name;
  }

  _setPassword(password) {
    this.password = password;
  }

  _firstRendered() {
    var appId = localStorage.getItem('appId');
    var user = localStorage.getItem('Parse/' + appId + '/currentUser');
    if (user == null) {
      this._openLogin();
      this.dispatchEvent(new CustomEvent('logged-change', {detail: {logged: false}}));
    }
  }

  _openLogin() {
    this.shadowRoot.getElementById('loginDialog').open();
  }

  _closeLogin() {
    this.shadowRoot.getElementById('loginDialog').close();
  }

  _notify(e) {
    // this.dispatchEvent(new CustomEvent('notify', {detail: {level: e.detail.level, message: e.detail.message}}));
  }
}

/* Register the new element with the browser */
window.customElements.define('login-dialog', LoginDialog);
