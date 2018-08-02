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
import '@polymer/iron-selector/iron-selector.js';

import('./person-item.js');

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { getPeople, addPerson, updatePerson, deletePerson } from '../actions/people.js';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

class People extends connect(store)(PageViewElement) {
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

        #addButton {
          position: fixed;
          bottom: 4.5rem;
          right: 20px;
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

        @media (min-width: 400px) {
          person-item {
            width: 100%;
          }
        }

        @media (min-width: 750px) {
          person-item {
            width: 50%;
          }
        }

        @media (min-width: 1280px) {
          person-item {
            width: 310px;
          }
        }
      </style>

      <div id='container'>
        <div class="flex">

          ${repeat(props.people, (item) => item.id, (item, index) => html`
            <person-item class="" key='${item}' index='${index}' person='${item}' on-edit-person='${(e) => { this._onEditPerson(e) }}' on-delete-person='${(e) => { this._onDeletePerson(e) }}'></person-item>
          `)}
        </div>
        <paper-fab id='addButton' icon='add' class='blue' on-click='${(e) => { this._openAddDialog() }}'></paper-fab>
        <paper-tooltip for="addButton" position="top" animation-delay="0">Add Person</paper-tooltip>


        <paper-dialog id='addDialog' with-backdrop>
          <h2 class='dialog-title'>CREATE PERSON</h2>
          <paper-input label='Name' value='${props.personToAdd.name}' on-value-changed='${(e) => { this._setPersonToAddName(e.detail.value) }}'></paper-input>
          <paper-input label='Title' value='${props.personToAdd.title}' on-value-changed='${(e) => { this._setPersonToAddTitle(e.detail.value) }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(addPerson(props.personToAdd.name, props.personToAdd.title)) }}'>Add Person</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='editDialog' with-backdrop>
          <h2 class='dialog-title'>EDIT PERSON</h2>
          <paper-input label='Name' value='${props.personToUpdate.name}' on-value-changed='${(e) => { this._setPersonToUpdateName(e.detail.value) }}'></paper-input>
          <paper-input label='Title' value='${props.personToUpdate.title}' on-value-changed='${(e) => { this._setPersonToUpdateTitle(e.detail.value) }}'></paper-input>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(updatePerson(props.personToUpdate.id, props.personToUpdate.name, props.personToUpdate.title)) }}'>Save</paper-button>
          </div>
        </paper-dialog>

        <paper-dialog id='deleteDialog' with-backdrop>
          <h2 class='dialog-title'>DELETE PERSON</h2>
          <p>Delete ${props.personToDelete.name.toUpperCase()}?</p>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(deletePerson(props.personToDelete.id)) }}'>Delete</paper-button>
          </div>
        </paper-dialog>

      </div>
    `;
  }

  static get properties() { return {
      people: Array,
      defaultPerson: Object,
      personToAdd: Object,
      personToUpdate: Object,
      personToDelete: Object,
      lastAddedPerson: Object,
      lastUpdatedPerson: Object,
      lastDeletedPerson: Object,
  }}

  constructor() {
    super();

    // Set up the property defaults here
    this.people = [];
    this.defaultPerson = {
      id: -1,
      name: '',
      title: ''
    };
    this.personToAdd =  Object.assign({}, this.defaultPerson);
    this.personToUpdate =  Object.assign({}, this.defaultPerson);
    this.personToDelete =  Object.assign({}, this.defaultPerson);
  }


  // This is called every time something is updated in the store.
  _stateChanged(state) {
    if (this.people != state.peopleReducer.people)
      this.people = state.peopleReducer.people;

    if (this.lastAddedPerson != state.peopleReducer.lastAddedPerson) {
      this.lastAddedPerson = state.peopleReducer.lastAddedPerson;
        if (Object.keys(this.lastAddedPerson).length > 0) {
          this._closeAddDialog();
      }
    }

    if (this.lastUpdatedPerson != state.peopleReducer.lastUpdatedPerson) {
      this.lastUpdatedPerson = state.peopleReducer.lastUpdatedPerson;
        if (Object.keys(this.lastUpdatedPerson).length > 0) {
          this._closeEditDialog();
      }
    }

    if (this.lastDeletedPerson != state.peopleReducer.lastDeletedPerson) {
      this.lastDeletedPerson = state.peopleReducer.lastDeletedPerson;
        if (Object.keys(this.lastDeletedPerson).length > 0) {
          this._closeDeleteDialog();
      }
    }
  }

  _firstRendered() {
    store.dispatch(getPeople());
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
    this.personToAdd = Object.assign({}, this.defaultPerson);
    this.shadowRoot.getElementById('addDialog').open();
  }

  _onEditPerson(e) {
    this.personToUpdate = e.detail.person;
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
}

/* Register the new element with the browser */
window.customElements.define('people-view', People);
