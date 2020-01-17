import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-dialog/paper-dialog';
import { store } from '../store';
import { login } from '../actions/login';
import loginReducer from '../reducers/login-reducer';
import { SharedStyles } from './shared-styles';

store.addReducers({ loginReducer });

class LoginDialog extends connect(store)(LitElement) {
  static get properties() {
    return {
      name: String,
      password: String,
    };
  }

  constructor() {
    super();
    this.name = '';
    this.password = '';
  }

  firstUpdated() {
    const appId = localStorage.getItem('appId');
    const user = localStorage.getItem(`Parse/${appId}/currentUser`);
    let logged = false;
    if (!user) {
      this._openLogin();
    } else {
      logged = true;
    }
    this.dispatchEvent(new CustomEvent('logged-change', { detail: { logged } }));
  }

  _setName(name) {
    this.name = name;
  }

  _setPassword(password) {
    this.password = password;
  }

  _openLogin() {
    this.shadowRoot.getElementById('loginDialog').open();
  }

  _closeLogin() {
    this.shadowRoot.getElementById('loginDialog').close();
  }

  render() {
    const {
      name,
      password,
    } = this;

    return html`
      <div id='container'>
        <paper-dialog id='loginDialog' with-backdrop no-cancel-on-outside-click no-cancel-on-esc-key>
          <h2 class='dialog-title'>LOGIN</h2>
          <paper-input label='User Name' value='' @value-changed='${(e) => { this._setName(e.detail.value); }}'></paper-input>
          <paper-input label='Password' type="password" value='' @value-changed='${(e) => { this._setPassword(e.detail.value); }}'></paper-input>
          <div class="buttons">
            <paper-button autofocus @click='${() => { store.dispatch(login(name, password)); }}'>Login</paper-button>
          </div>
        </paper-dialog>
      </div>
    `;
  }

  stateChanged({ loginReducer: { user } }) {
    if (this.user !== user && Object.keys(user).length) {
      this.dispatchEvent(new CustomEvent('logged-change', { detail: { logged: true } }));
      this._closeLogin();
    }
  }

  static get styles() {
    return [
      SharedStyles,
      css`
      :host {
        display: block;
        height: 100%;
        display: block;

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
      `,
    ];
  }
}

/* Register the new element with the browser */
window.customElements.define('login-dialog', LoginDialog);
