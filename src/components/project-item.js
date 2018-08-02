import { LitElement, html } from '@polymer/lit-element';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

class ProjectItem extends LitElement {
  _render(props) {
    return html`
      ${SharedStyles}
      <style>
        paper-card.project-details {
          z-index: 15;
          width: 100%;
          /* height: 100%; */
          border-radius: 5px;
          color: var(--app-secondary-color);
          --paper-card-header-color: #fff;
          --paper-card-header: {
            background-color: var(--app-secondary-color);
          };
          --paper-card-header-text: {
            font-size: 20px;
          };
        }

        .flex {
          @apply --layout-horizontal;
        }

        .card-actions {
          font-size: 14px;
          text-align: right;
        }

        paper-card.project-details:hover  {
          color: #009688;
        }

        paper-card.project-details .card-actions {
          visibility: hidden;
        }

        paper-card.project-details:hover .card-actions {
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
      </style>

      <paper-card class="project-details">
        <div class="card-content">
          <paper-icon-item>
            <iron-icon icon="icons:work" slot="item-icon"></iron-icon>
            <paper-item-body two-line>
              <div><b>${props.project.name.toUpperCase()}</b></div>
              <div secondary></div>
            </paper-item-body>
          </paper-icon-item>
          </div>
          <div class="card-actions">
            <paper-button on-click='${(e) => { this._editClicked() }}'>Edit</paper-button>
            <paper-button on-click='${(e) => { this._deleteClicked() }}'>Delete</paper-button>
          </div>
        </paper-card>
    `;
  }

  static get properties() { return {
    index: Number,
    project: Object
  }}

  constructor() {
    super();
    // Set up the property defaults here
    this.index = 0;
    this.project = {
      id: -1,
      name: ''
    };
  }

  _editClicked() {
    this.dispatchEvent(new CustomEvent('edit-project', {detail: {project: this.project}}));
  }

  _deleteClicked() {
    this.dispatchEvent(new CustomEvent('delete-project', {detail: {project: this.project}}));
  }
}

/* Register the new element with the browser */
window.customElements.define('project-item', ProjectItem);
