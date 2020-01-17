import { html, css } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { connect } from 'pwa-helpers/connect-mixin';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-dialog/paper-dialog';
import PageViewElement from './page-view-element';
import './person-item';
// This element is connected to the Redux store.
import { store } from '../store';
// These are the actions needed by this element.
import {
  getPeople,
  addPerson,
  updatePerson,
  deletePerson,
} from '../actions/people';
/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles';

class People extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      people: Array,
      defaultPerson: Object,
      personToAdd: Object,
      personToUpdate: Object,
      personToDelete: Object,
      lastAddedPerson: Object,
      lastUpdatedPerson: Object,
      lastDeletedPerson: Object,
    };
  }

  constructor() {
    super();
    this.people = [];
    this.defaultPerson = {
      id: -1,
      name: '',
      title: '',
    };
    this.personToAdd = { ...this.defaultPerson };
    this.personToUpdate = { ...this.defaultPerson };
    this.personToDelete = { ...this.defaultPerson };
  }

  firstUpdated() {
    store.dispatch(getPeople());
  }

  stateChanged(state) {
    if (this.people !== state.peopleReducer.people) {
      this.people = state.peopleReducer.people;
    }

    if (this.lastAddedPerson !== state.peopleReducer.lastAddedPerson) {
      this.lastAddedPerson = state.peopleReducer.lastAddedPerson;
      if (Object.keys(this.lastAddedPerson).length > 0) {
        this._closeAddDialog();
      }
    }

    if (this.lastUpdatedPerson !== state.peopleReducer.lastUpdatedPerson) {
      this.lastUpdatedPerson = state.peopleReducer.lastUpdatedPerson;
      if (Object.keys(this.lastUpdatedPerson).length > 0) {
        this._closeEditDialog();
      }
    }

    if (this.lastDeletedPerson !== state.peopleReducer.lastDeletedPerson) {
      this.lastDeletedPerson = state.peopleReducer.lastDeletedPerson;
      if (Object.keys(this.lastDeletedPerson).length > 0) {
        this._closeDeleteDialog();
      }
    }
  }

  _setPersonToAddName(value) {
    this.personToAdd.name = value;
  }

  _setPersonToAddTitle(value) {
    this.personToAdd.title = value;
  }

  _setPersonToUpdateName(value) {
    this.personToUpdate.name = value;
  }

  _setPersonToUpdateTitle(value) {
    this.personToUpdate.title = value;
  }

  _openAddDialog() {
    this.personToAdd = { ...this.defaultPerson };
    this.shadowRoot.getElementById('addDialog').open();
  }

  _onEditPerson(e) {
    this.personToUpdate = e.detail.person;
    console.log(e);
    this.shadowRoot.getElementById('editDialog').open();
  }

  _onDeletePerson(e) {
    this.personToDelete = e.detail.person;
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
    store.dispatch(getPeople());
  }

  render() {
    const {
      people,
      personToAdd,
      personToUpdate,
      personToDelete,
    } = this;
    return html`
      <div id='container'>
        <div class="people-list">
        ${repeat(people, (item) => item.id, (item, index) => html`
          <person-item key='${item.id}' index='${index}' .person='${item}' @edit-person='${(e) => { this._onEditPerson(e); }}' @delete-person='${(e) => { this._onDeletePerson(e); }}'></person-item>
        `)}
        </div>

        <paper-dialog id='addDialog' with-backdrop>
          <h2 class='dialog-title'>CREATE PERSON</h2>
          <paper-input label='Name' value='${personToAdd.name}' @value-changed='${(e) => { this._setPersonToAddName(e.detail.value); }}'></paper-input>
          <paper-input label='Title' value='${personToAdd.title}' @value-changed='${(e) => { this._setPersonToAddTitle(e.detail.value); }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${() => store.dispatch(addPerson(personToAdd.name, personToAdd.title))}'>Add Person</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='editDialog' with-backdrop>
          <h2 class='dialog-title'>EDIT PERSON</h2>
          <paper-input label='Name' value='${personToUpdate.name}' @value-changed='${(e) => { this._setPersonToUpdateName(e.detail.value); }}'></paper-input>
          <paper-input label='Title' value='${personToUpdate.title}' @value-changed='${(e) => { this._setPersonToUpdateTitle(e.detail.value); }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${() => store.dispatch(updatePerson(personToUpdate.id, personToUpdate.name, personToUpdate.title))}'>Save</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='deleteDialog' with-backdrop>
          <h2 class='dialog-title'>DELETE PERSON</h2>
          <p>Delete ${personToDelete.name.toUpperCase()}?</p>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${() => store.dispatch(deletePerson(personToDelete.id))}'>Delete</paper-button>
          </div>
        </paper-dialog>

        <span class="people-controls">
          <div class="people-controls__btn btn-add">
            <paper-icon-button slot="suffix" icon="add" @click='${this._openAddDialog}}'></paper-icon-button>
          </div>
        </span>
      </div>
    `;
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

        .people-list {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
        }

        #dialog {
          padding: 15px;
        }

        person-item {
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

        .people-controls {
          color: white;
          position: fixed;
          bottom: 32px;
          left: 20px;
          display: flex;
        }

        .people-controls__btn {
          background-color: black;
          color: white;
          opacity: 0.7;
        }

        .people-controls__btn:hover {
                opacity: 1;
        }

        .people-controls__btn.btn-add {
                border-radius: 5px;
                margin-right: 8px;
        }

        .people-controls__btn.btn-add:hover {
                color: #448aff;
        }

        @media (min-width: 400px) {
          .people-list {
            grid-template-columns: repeat(1, 1fr);
          }
        }

        @media (min-width: 600px) {
          .people-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1000px) {
          .people-list {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .people-list {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (min-width: 1600px) {
          .people-list {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (min-width: 1800px) {
          .people-list {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `,
    ];
  }
}

/* Register the new element with the browser */
window.customElements.define('people-view', People);
