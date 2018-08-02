import { LitElement, html } from '@polymer/lit-element';
import {repeat} from "lit-html/lib/repeat"
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

import { setNotification } from '../actions/notification.js';

/* Extend the base PolymerElement class */
class TaskDialog extends connect(store)(LitElement) {
  _render(props) {
    var person = this._computePerson(props.people, props.task);
    var project = this._computeProject(props.projects, props.task);
    var from = this._computeFrom(props.task);
    var to = this._computeTo(props.task);

    return html`
    ${SharedStyles}
      <style>
        paper-dialog {
          padding: 15px;
          border-radius: 5px;
        }

        paper-dropdown-menu,
        paper-listbox {
          width: 280px;
        }

        paper-item {
          /* width: 100%; */
        }

        .dialog-title {
          margin: -15px;
          padding: 24px 39px;
          background-color: var(--app-secondary-color);
          color: white;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }

        #fromDate,
        #toDate {
          width: 100%;
        }
      </style>

      <paper-dialog id='${props.dialogId}' with-backdrop on-iron-overlay-closed='${(e) => { this._overlayClosed() }}'>
        <h2 class='dialog-title'>${props.dialogTitle.toUpperCase()}</h2>
        <paper-input id='taskName' label='Task Name' value='${props.task.name}' on-value-changed='${(e) => { this._nameChanged(e) }}'></paper-input>
        <div class='flex'>
          <paper-dropdown-menu label="Person">
            <paper-listbox slot="dropdown-content" attr-for-selected='key' selected='${person}' on-selected-changed='${(e) => { this._personChanged(e) }}'>
              ${repeat(props.people, (item) => item.id, (item, index) => html`
                <paper-item key='${item}'>${item.name}</paper-item>
              `)}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class='flex'>
          <paper-dropdown-menu label="Project" >
            <paper-listbox slot="dropdown-content" attr-for-selected='key' selected='${project}'  on-selected-changed='${(e) => { this._projectChanged(e) }}'>
            ${repeat(props.projects, (item) => item.id, (item, index) => html`
              <paper-item key='${item}'>${item.name}</paper-item>
            `)}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class='flex'>
          <vaadin-date-picker id='fromDate' label="FROM" value=${from} on-value-changed='${(e) => { this._fromChanged(e) }}'></vaadin-date-picker>
        </div>
        <div class='flex'>
          <vaadin-date-picker id='toDate' label="TO" value=${to}  on-value-changed='${(e) => { this._toChanged(e) }}'></vaadin-date-picker>
        </div>
        <div class="buttons">
          <paper-button dialog-dismiss>Cancel</paper-button>
          <paper-button autofocus on-click='${(e) => { this._saveTask(person, project, from, to) }}'>Save Task</paper-button>
        </div>
      </paper-dialog>
    `;
  }

  static get properties() { return {
      dialogTitle: String,
      dialogId: String,
      task: Object,
      people: Array,
      projects: Array
  }};

  constructor() {
    super();
    // Set up the property defaults here
    this.dialogTitle = '';
    this.dialogId = '';
    this.task = {
      id: '',
      name: '',
      personId: '',
      projectId: '',
      from: '',
      to: ''
    },
    this.people = [];
    this.projects = [];
  }

  _stateChanged(state) {
  }

  _computePerson(people, task) {
    var person = {};
    if (task.personId != '') {
      person = people.filter(function (person) {
        return task.personId == person.id;
      })[0];
    }
    return person;
  }

  _computeProject(projects, task) {
    var project = {};
    if (task.projectId != '') {
      project = projects.filter(function (project) {
        return task.projectId == project.id;
      })[0];
    }
    return project;
  }

  _computeFrom(task) {
    return task.from  != '' ? moment(task.from).format('YYYY-MM-DD') : '';
  }

  _computeTo(task) {
    return task.to  != '' ? moment(task.to).format('YYYY-MM-DD') : '';
  }

  open() {
    this.shadowRoot.getElementById(this.dialogId).open();
  }

  _overlayClosed() {
    this.dispatchEvent(new CustomEvent('close-dialog'));
  }

  close() {
    this.shadowRoot.getElementById(this.dialogId).close();
  }

  _nameChanged(e) {
    this.name = e.detail.value
  }

  _personChanged(e) {
    this.person = e.detail.value;
  }

  _projectChanged(e) {
    this.project = e.detail.value;
  }

  _fromChanged(e) {
    this.from = moment(e.detail.value).format('YYYY-MM-DD');
  }

  _toChanged(e) {
    this.to = moment(e.detail.value).format('YYYY-MM-DD');
  }

  _saveTask() {
    if (this.name != '' && this.person != {} && this.project != {} && this.from != '' && this.to != '') {
      var task = {
        id: this.task.id,
        name: this.name,
        personId: this.person.id,
        projectId: this.project.id,
        from: moment(this.from).toDate(),
        to: moment(this.to).toDate()
      };
      this.task = task;
      this.dispatchEvent(new CustomEvent('save-task', {detail: {task: task}}));
    } else {
      var level = 'warning';
      var message = 'Please, make sure fields are not empty.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      store.dispatch(setNotification(level, message));
      console.log(message);
    }
  }
}

/* Register the new element with the browser */
window.customElements.define('task-dialog', TaskDialog);
