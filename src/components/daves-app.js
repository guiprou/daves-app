import { LitElement, html, css } from 'lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import { connect } from 'pwa-helpers/connect-mixin';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query';
import { installOfflineWatcher } from 'pwa-helpers/network';
import { installRouter } from 'pwa-helpers/router';
import { updateMetadata } from 'pwa-helpers/metadata';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/paper-toast/paper-toast';
import { menuIcon } from './my-icons';
import './login-dialog';
import { store } from '../store';
import {
  navigate,
  updateOffline,
  updateDrawerState,
  updateLayout,
} from '../actions/app';
import tasksReducer from '../reducers/tasks-reducer';
import peopleReducer from '../reducers/people-reducer';
import projectsReducer from '../reducers/projects-reducer';
import notificationReducer from '../reducers/notification-reducer';

store.addReducers({
  tasksReducer,
  peopleReducer,
  projectsReducer,
  notificationReducer,
});

class DavesApp extends connect(store)(LitElement) {
  static get properties() {
    return {
      appTitle: { type: String },
      _page: { type: String },
      _drawerOpened: { type: Boolean },
      _snackbarOpened: { type: Boolean },
      _offline: { tyoe: Boolean },
      notification: { type: Object },
      logged: { type: Boolean },
    };
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
    setPassiveTouchGestures(true);
    this.notification = {
      level: '',
      message: '',
      duration: 3000,
    };
    this.logged = false;
  }

  firstUpdated() {
    installRouter((location) => store.dispatch(navigate(location)));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher('(min-width: 648px) and (min-height: 648px)',
      (matches) => store.dispatch(updateLayout(matches)));
  }

  updated(changedProperties) {
    const {
      appTitle,
      _page,
    } = this;
    if (changedProperties.has('_page')) {
      const pageTitle = `${appTitle} - ${_page}`;
      updateMetadata({
        title: pageTitle,
        description: pageTitle,
      });
    }
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._snackbarOpened = state.app.snackbarOpened;
    this._drawerOpened = state.app.drawerOpened;
    if (this.notification !== state.notificationReducer.notification
      && Object.keys(state.notificationReducer.notification).length !== 0
      && state.notificationReducer.notification.constructor === Object) {
      this.notification = state.notificationReducer.notification;
      this.notify(state.notificationReducer.notification.level,
        state.notificationReducer.notification.message);
    }
  }

  render() {
    const {
      appTitle,
      _page,
      _drawerOpened,
      logged,
    } = this;
    const hidden = logged ? 'visible' : 'hidden';
    return html`
    <login-dialog @logged-change='${(e) => { this.loggedChanged(e); }}'></login-dialog>

    <!-- Header -->
    <app-header condenses reveals effects="waterfall">
      <app-toolbar class="toolbar-top">
        <button class="menu-btn" title="Menu" on-click="${() => store.dispatch(updateDrawerState(true))}">${menuIcon}</button>
        <div main-title><img class="menu-logo" src="./images/dapp_logo.png" alt=${appTitle} width="100" height="50"></div>
      </app-toolbar>
      <!-- This gets hidden on a small screen-->
      <nav class="toolbar-list" sticky>
        <a ?selected="${_page === 'schedule'}" href="/schedule-view">Schedule</a>
        <a ?selected="${_page === 'people'}" href="/people-view">People</a>
        <a ?selected="${_page === 'projects'}" href="/projects-view">Projects</a>
      </nav>
    </app-header>

    <!-- Drawer content -->
    <app-drawer .opened="${_drawerOpened}"
        on-opened-changed="${(e) => store.dispatch(updateDrawerState(e.target.opened))}">
      <nav class="drawer-list">
        <a ?selected="${_page === 'schedule'}" href="/schedule-view">Schedule</a>
        <a ?selected="${_page === 'people'}" href="/people-view">People</a>
        <a ?selected="${_page === 'projects'}" href="/projects-view">Projects</a>
      </nav>
    </app-drawer>

    <!-- Main content -->
    <main class=${`main-content ${hidden}`}>
      <schedule-view class="page schedule-view" ?active="${_page === 'schedule'}" id='scheduleView' on-notify='notify'></schedule-view>
      <people-view class="page" ?active="${_page === 'people'}" id='peopleView' on-notify='notify'></people-view>
      <projects-view class="page" ?active="${_page === 'projects'}" id='projectsView' on-notify='notify'></projects-view>
      <my-view404 class="page" ?active="${_page === 'view404'}"></my-view404>
    </main>

    <paper-toast id='toast'></paper-toast>
    <footer class="footer">
      <p>Red Bee Media</p>
    </footer>
    `;
  }

  notify(level, message) {
    const toast = this.shadowRoot.getElementById('toast');
    toast.cancel();
    toast.className = `notification-${level}`;
    toast.text = message;
    toast.duration = 3000;
    // this.$.toast.positionTarget = this.$.appLayer;
    toast.open();
  }

  loggedChanged(e) {
    this.logged = e.detail.logged;
  }

  static get styles() {
    return [
      css`
      :host {
        --app-drawer-width: 256px;
        display: block;

        --app-primary-color: #ec407a;
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
        --app-drawer-selected-color: white;
      }

      app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
      }

      app-header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        text-align: center;
        color: #fff;
        /* background-color: var(--app-primary-color); */
        border-bottom: 1px solid #eee;
      }

      app-header paper-icon-button {
        --paper-icon-button-ink-color: white;
      }

      .toolbar-top {
        background-color: var(--app-header-background-color);
        padding-top: 10px;
      }

      [main-title] {
        font-family: 'Pacifico';
        text-transform: lowercase;
        font-size: 30px;
        /* In the narrow layout, the toolbar is offset by the width of the
        drawer button, and the text looks not centered. Add a padding to
        match that button */
        padding-right: 44px;
      }

      .menu-logo {
        vertical-align: bottom;
      }

      .toolbar-list {
        display: none;
        background-color: white;
      }

      .toolbar-list > a {
        display: inline-block;
        color: var(--app-header-text-color);
        text-decoration: none;
        line-height: 30px;
        padding: 10px 24px;
      }

      .toolbar-list > a[selected] {
        color: var(--app-header-selected-color);
        border-bottom: 4px solid var(--app-header-selected-color);
      }

      .menu-btn {
        background: none;
        border: none;
        fill: var(--app-header-text-color);
        cursor: pointer;
        height: 44px;
        width: 44px;
      }

      .drawer-list {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        margin: 0 20px;
        padding: 24px;
        background: var(--app-drawer-background-color);
        position: relative;
      }

      .drawer-list > a {
        display: block;
        text-decoration: none;
        color: #78909C;
        line-height: 40px;
        padding: 0 24px;
      }

      .drawer-list > a[selected] {
        color: var(--app-drawer-selected-color);
      }

      .drawer-list a.iron-selected {
        color: black;
        font-weight: bold;
      }

      .main-content {
        padding-top: 64px;
        background-color: #F5F6FA;
      }

      .page {
        display: none;
      }

      .schedule-view {
        height: calc(100vh - 100px);
      }

      .page[active] {
        display: block;
      }

      .footer {
        padding: 24px;
        background: var(--app-drawer-background-color);
        color: var(--app-drawer-text-color);
        text-align: center;
      }

      iron-pages {
        height: 90%;
      }

      paper-toast {
        border-radius: 3px
      }

      .notification-success {
        --paper-toast-background-color: #009688;
        --paper-toast-color: white;
      }

      .notification-warning {
        --paper-toast-background-color: #ff5722;
        --paper-toast-color: white;
      }

      .notification-error {
        --paper-toast-background-color: #e53935;
        --paper-toast-color: white;
      }

      .hidden {
        visibility: hidden;
      }

      app-drawer,
      app-header {
        z-index: 100;
      }

      /* Wide layout: when the viewport width is bigger than 460px, layout
      changes to a wide layout. */
      @media (min-width: 400px) {
        .toolbar-list {
          display: block;
        }

        .menu-btn {
          display: none;
        }

        .main-content {
          padding-top: 128px;
          /* min-height: 589px; */
        }

        /* The drawer button isn't shown in the wide layout, so we don't
        need to offset the title */
        [main-title] {
          padding-right: 0px;
        }
      }

      @media (min-width: 750px) {
        .main-content {
          padding-top: 128px;
          /* min-height: 850px; */
        }
      }

      @media (min-width: 1600px) {
        .main-content {
          padding-top: 128px;
          /* min-height: 623px; */
        }
      }

      @media (min-width: 1920px) {
        .main-content {
          padding-top: 128px;
          /* min-height: 763px; */
        }
      }

      @media (max-width: 600px) {
        .footer {
          padding: 44px 24px 4px 24px;
        }
      }
      `,
    ];
  }
}

window.customElements.define('daves-app', DavesApp);
