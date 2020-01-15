import { LitElement, html, css } from 'lit-element';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/social-icons';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles';

class PersonItem extends LitElement {
  render() {
    const { person: { name, title } } = this;
    return html`
      <paper-card class="person-details">
        <div class="card-content">
        <paper-icon-item>
          <iron-icon icon="social:person" slot="item-icon"></iron-icon>
          <paper-item-body two-line>
            <div><b>${name.toUpperCase()}</b></div>
            <div secondary>${title}</div>
          </paper-item-body>
        </paper-icon-item>
        </div>
        <div class="card-actions">
          <paper-button @click='${this._editClicked}'>Edit</paper-button>
          <paper-button @click='${this._deleteClicked}'>Delete</paper-button>
        </div>
      </paper-card>
    `;
  }

  static get properties() {
    return {
      index: Number,
      person: Object,
    };
  }

  constructor() {
    super();
    // Set up the property defaults here
    this.index = 0;
    this.person = {
      name: '',
      title: '',
    };
  }

  _editClicked() {
    this.dispatchEvent(new CustomEvent('edit-person', { detail: { person: this.person } }));
  }

  _deleteClicked() {
    this.dispatchEvent(new CustomEvent('delete-person', { detail: { person: this.person } }));
  }

  static get styles() {
    return [
      SharedStyles,
      css`
      paper-card.person-details {
        width: 100%;
        /* height: 100%; */
        border-radius: 5px;
        --paper-card-header-color: #fff;
        --paper-card-header: {
          background-color: var(--app-secondary-color);
        };
        --paper-card-header-text: {
          font-size: 20px;
        };
        color: var(--app-secondary-color);
      }

      .flex {
        @apply --layout-horizontal;
      }

      .card-actions {
        font-size: 14px;
        text-align: right;
      }

      paper-card.person-details:hover  {
        color: #3f51b5;
      }

      paper-card.person-details .card-actions {
        visibility: hidden;
      }

      paper-card.person-details:hover .card-actions {
        visibility: visible;
      }

      paper-icon-item {
        padding: 0;
       --paper-item-focused-before: {
          background: none;
        };
      }

      paper-item-body div {
        white-space: normal;
      }
      `,
    ];
  }
}

/* Register the new element with the browser */
window.customElements.define('person-item', PersonItem);
