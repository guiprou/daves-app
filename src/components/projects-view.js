import { html } from '@polymer/lit-element';
import {repeat} from "lit-html/lib/repeat"
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-tooltip/paper-tooltip.js';

import('./project-item.js');

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { getProjects, addProject, updateProject, deleteProject } from '../actions/projects.js';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

class Projects extends connect(store)(PageViewElement) {
  _render(props) {
    return html`
      ${SharedStyles}
      <style>
        :host {
          display: block;
          height: 100%;
        }

        #container {
          height: 100%;
          padding: 0 0 30px 30px;
        }

        .flex {
          @apply --layout-horizontal;
          @apply --layout-wrap;
        }

        paper-fab {
          z-index: 20;
        }

        paper-fab.blue {
          --paper-fab-background: #448aff;
          --paper-fab-keyboard-focus-background: #448aff;
        }

        paper-fab.red {
          --paper-fab-background: #f44336;
          --paper-fab-keyboard-focus-background: #b71c1c;
        }

        #addButton {
          position: fixed;
          bottom: 4.5rem;
          right: 20px;
        }

        #dialog {
          padding: 15px;
        }

        project-item {
          padding: 30px 30px 0 0;
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

        @media (min-width: 400px) {
          project-item {
            width: 100%;
          }
        }

        @media (min-width: 750px) {
          project-item {
            width: 50%;
          }
        }

        @media (min-width: 1280px) {
          project-item {
            width: 310px;
          }
        }
      </style>

      <div id='container'>
        <div class="flex">
          ${repeat(props.projects, (item) => item.id, (item, index) => html`
            <project-item key='${item}' index='${index}' project='${item}' on-edit-project='${(e) => { this._onEditProject(e) }}' on-delete-project='${(e) => { this._onDeleteProject(e) }}'></person-item>
          `)}

          <paper-fab id='addButton' icon='add' class='blue' on-click='${(e) => { this._openAddDialog() }}'></paper-fab>
          <paper-tooltip for="addButton" position="top" animation-delay="0">Add Project</paper-tooltip>
        </div>

        <paper-dialog id='addDialog' with-backdrop>
          <h2 class='dialog-title'>CREATE PROJECT</h2>
          <paper-input label='Name' value='${props.projectToAdd.name}' on-value-changed='${(e) => { this._setProjectToAddName(e.detail.value) }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(addProject(props.projectToAdd.name)) }}'>Add Project</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='editDialog' with-backdrop>
          <h2 class='dialog-title'>EDIT PROJECT</h2>
          <paper-input label='Name' value='${props.projectToUpdate.name}' on-value-changed='${(e) => { this._setProjectToUpdateName(e.detail.value) }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(updateProject(props.projectToUpdate.id, props.projectToUpdate.name)) }}'>Save</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='deleteDialog' with-backdrop>
          <h2 class='dialog-title'>DELETE PROJECT</h2>
          <p>Delete ${props.projectToDelete.name.toUpperCase()}?</p>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(deleteProject(props.projectToDelete.id)) }}'>Delete</paper-button>
          </div>
        </paper-dialog>
      </div>
    `;
  }

  static get properties() { return {
      projects: Array,
      defaultProject: Object,
      projectToAdd: Object,
      projectToUpdate: Object,
      projectToDelete: Object,
      lastAddedProject: Object,
      lastDeletedProject: Object
    }
  }


  constructor() {
    super();

    // Set up the property defaults here
    this.projects = [];
    this.defaultProject = {
      id: -1,
      name: ''
    };
    this.projectToAdd =  Object.assign({}, this.defaultProject);
    this.projectToUpdate =  Object.assign({}, this.defaultProject);
    this.projectToDelete =  Object.assign({}, this.defaultProject);
  }

  // This is called every time something is updated in the store.
  _stateChanged(state) {
    if (this.projects != state.projectsReducer.projects)
      this.projects = state.projectsReducer.projects;

    if (this.lastAddedProject != state.projectsReducer.lastAddedProject) {
      this.lastAddedProject = state.projectsReducer.lastAddedProject;
        if (Object.keys(this.lastAddedProject).length > 0) {
          this._closeAddDialog();
      }
    }

    if (this.lastUpdatedProject != state.projectsReducer.lastUpdatedProject) {
      this.lastUpdatedProject = state.projectsReducer.lastUpdatedProject;
        if (Object.keys(this.lastUpdatedProject).length > 0) {
          this._closeEditDialog();
      }
    }

    if (this.lastDeletedProject != state.projectsReducer.lastDeletedProject) {
      this.lastDeletedProject = state.projectsReducer.lastDeletedProject;
        if (Object.keys(this.lastDeletedProject).length > 0) {
          this._closeDeleteDialog();
      }
    }
  }

  _firstRendered() {
    store.dispatch(getProjects());
  }

  _setProjectToAddName(value) {
    this.projectToAdd.name = value;
  }

  _setProjectToUpdateName(value) {
    this.projectToUpdate.name = value;
  }

  _openAddDialog() {
    this.projectToAdd =  Object.assign({}, this.defaultProject);
    this.shadowRoot.getElementById('addDialog').open();
  }

  _onEditProject(e) {
    this.projectToUpdate = e.detail.project;
    this.shadowRoot.getElementById('editDialog').open();
  }

  _onDeleteProject(e) {
    this.projectToDelete = e.detail.project;
    this.shadowRoot.getElementById('deleteDialog').open();
  }

  _closeAddDialog() {
    this.shadowRoot.getElementById('addDialog').close();
  }

  _closeEditDialog() {
    this.shadowRoot.getElementById('editDialog').close();
  }

  _closeDeleteDialog() {
    this.shadowRoot.getElementById('deleteDialog').close();
  }

  refresh() {
    store.dispatch(getProjects());
  }

  _notify(e) {
    // this.dispatchEvent(new CustomEvent('notify', {detail: {level: e.detail.level, message: e.detail.message}}));
  }
}

/* Register the new element with the browser */
window.customElements.define('projects-view', Projects);
