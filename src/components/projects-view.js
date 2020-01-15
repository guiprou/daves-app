import { html, css } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { connect } from 'pwa-helpers/connect-mixin';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-fab/paper-fab';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-tooltip/paper-tooltip';
import PageViewElement from './page-view-element';
import './project-item';
// This element is connected to the Redux store.
import { store } from '../store';
// These are the actions needed by this element.
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
} from '../actions/projects';
/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles';

class Projects extends connect(store)(PageViewElement) {
  render() {
    const {
      projects,
      projectToAdd,
      projectToUpdate,
      projectToDelete,
    } = this;
    return html`
      <div id='container'>
        <div class="projects-list">
          ${repeat(projects, (item) => item.id, (item, index) => html`
            <project-item key='${item.id}' index='${index}' .project='${item}' @edit-project='${(e) => { this._onEditProject(e); }}' @delete-project='${(e) => { this._onDeleteProject(e); }}'></person-item>
          `)}
        </div>

        <paper-dialog id='addDialog' with-backdrop>
          <h2 class='dialog-title'>CREATE PROJECT</h2>
          <paper-input label='Name' value='${projectToAdd.name}' @value-changed='${(e) => { this._setProjectToAddName(e.detail.value); }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${() => store.dispatch(addProject(projectToAdd.name))}'>Add Project</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='editDialog' with-backdrop>
          <h2 class='dialog-title'>EDIT PROJECT</h2>
          <paper-input label='Name' value='${projectToUpdate.name}' @value-changed='${(e) => { this._setProjectToUpdateName(e.detail.value); }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${() => store.dispatch(updateProject(projectToUpdate.id, projectToUpdate.name))}'>Save</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='deleteDialog' with-backdrop>
          <h2 class='dialog-title'>DELETE PROJECT</h2>
          <p>Delete ${projectToDelete.name.toUpperCase()}?</p>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${() => store.dispatch(deleteProject(projectToDelete.id))}'>Delete</paper-button>
          </div>
        </paper-dialog>

        <span class="projects-controls">
          <div class="projects-controls__btn btn-add">
            <paper-icon-button slot="suffix" icon="add" @click='${this._openAddDialog}}'></paper-icon-button>
          </div>
        </span>

      </div>
    `;
  }

  static get properties() {
    return {
      projects: Array,
      defaultProject: Object,
      projectToAdd: Object,
      projectToUpdate: Object,
      projectToDelete: Object,
      lastAddedProject: Object,
      lastDeletedProject: Object,
    };
  }

  constructor() {
    super();

    // Set up the property defaults here
    this.projects = [];
    this.defaultProject = {
      id: -1,
      name: '',
    };
    this.projectToAdd = { ...this.defaultProject };
    this.projectToUpdate = { ...this.defaultProject };
    this.projectToDelete = { ...this.defaultProject };
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    if (this.projects !== state.projectsReducer.projects) {
      this.projects = state.projectsReducer.projects;
    }

    if (this.lastAddedProject !== state.projectsReducer.lastAddedProject) {
      this.lastAddedProject = state.projectsReducer.lastAddedProject;
      if (Object.keys(this.lastAddedProject).length > 0) {
        this._closeAddDialog();
      }
    }

    if (this.lastUpdatedProject !== state.projectsReducer.lastUpdatedProject) {
      this.lastUpdatedProject = state.projectsReducer.lastUpdatedProject;
      if (Object.keys(this.lastUpdatedProject).length > 0) {
        this._closeEditDialog();
      }
    }

    if (this.lastDeletedProject !== state.projectsReducer.lastDeletedProject) {
      this.lastDeletedProject = state.projectsReducer.lastDeletedProject;
      if (Object.keys(this.lastDeletedProject).length > 0) {
        this._closeDeleteDialog();
      }
    }
  }

  firstUpdated() {
    store.dispatch(getProjects());
  }

  _setProjectToAddName(value) {
    this.projectToAdd.name = value;
  }

  _setProjectToUpdateName(value) {
    this.projectToUpdate.name = value;
  }

  _openAddDialog() {
    this.projectToAdd = { ...this.defaultProject };
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

  static get styles() {
    return [
      SharedStyles,
      css`
      :host {
        display: block;
        height: 100%;
      }

      #container {
        height: 100%;
        padding: 0 0 30px 30px;
      }

      .projects-list {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
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

      .projects-controls {
        color: white;
        position: fixed;
        bottom: 32px;
        left: 20px;
        display: flex;
      }

      .projects-controls__btn {
        background-color: black;
        color: white;
        opacity: 0.7;
      }

      .projects-controls__btn:hover {
              opacity: 1;
      }

      .projects-controls__btn.btn-add {
              border-radius: 5px;
              margin-right: 8px;
      }

      .projects-controls__btn.btn-add:hover {
              color: #448aff;
      }

      @media (min-width: 400px) {
        .projects-list {
          grid-template-columns: repeat(1, 1fr);
        }
      }

      @media (min-width: 600px) {
        .projects-list {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1000px) {
        .projects-list {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (min-width: 1200px) {
        .projects-list {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      @media (min-width: 1600px) {
        .projects-list {
          grid-template-columns: repeat(5, 1fr);
        }
      }

      @media (min-width: 1800px) {
        .projects-list {
          grid-template-columns: repeat(6, 1fr);
        }
      }
      `,
    ];
  }
}

/* Register the new element with the browser */
window.customElements.define('projects-view', Projects);
