import { LitElement, html, css } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../store';
import { SharedStyles } from './shared-styles';
import { setNotification } from '../actions/notification';

/* Extend the base PolymerElement class */
class TaskDialog extends connect(store)(LitElement) {
  static get properties() {
    return {
      dialogTitle: String,
      dialogId: String,
      task: Object,
      people: Array,
      projects: Array,
    };
  }

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
      to: '',
    };
    this.people = [];
    this.projects = [];
  }

  _computePerson(people, task) {
    return task.personId ? people.find((person) => (task.personId === person.id)) : {};
  }

  _computeProject(projects, task) {
    return task.projectId ? projects.find((project) => (task.projectId === project.id)) : {};
  }

  _computeFrom(task) {
    return task.from ? moment(task.from).format('YYYY-MM-DD') : '';
  }

  _computeTo(task) {
    return task.to ? moment(task.to).format('YYYY-MM-DD') : '';
  }

  open() {
    this.shadowRoot.getElementById(this.dialogId).open();
  }

  _overlayClosed() {
    this.dispatchEvent(new CustomEvent('close-dialog'));
  }

  _deleteClicked() {
    this.dispatchEvent(new CustomEvent('delete-task'));
  }

  close() {
    this.shadowRoot.getElementById(this.dialogId).close();
  }

  _nameChanged(e) {
    this.name = e.detail.value;
  }

  _personChanged(e) {
    this.personId = e.detail.value;
  }

  _projectChanged(e) {
    this.projectId = e.detail.value;
  }

  _fromChanged(e) {
    this.from = moment(e.detail.value).format('YYYY-MM-DD');
  }

  _toChanged(e) {
    this.to = moment(e.detail.value).format('YYYY-MM-DD');
  }

  _dismiss() {
    this.shadowRoot.getElementById(this.dialogId).close();
  }

  _saveTask() {
    const {
      task: { id },
      name,
      personId,
      projectId,
      from,
      to,
    } = this;

    if (name && personId && projectId && from && to) {
      if (moment(from) < moment(to)) {
        const task = {
          id,
          name,
          personId,
          projectId,
          from: moment(from).toDate(),
          to: moment(to).toDate(),
        };
        this.task = task;
        this.dispatchEvent(new CustomEvent('save-task', { detail: { task } }));
      } else {
        const level = 'warning';
        const message = 'Please, make sure end time is after start time.';
        store.dispatch(setNotification(level, message));
        console.log(message);
      }
    } else {
      const level = 'warning';
      const message = 'Please, make sure fields are not empty.';
      store.dispatch(setNotification(level, message));
      console.log(message);
    }
  }

  render() {
    const {
      people,
      projects,
      task,
      dialogId,
      dialogTitle,
    } = this;
    const person = this._computePerson(people, task);
    const project = this._computeProject(projects, task);
    const from = this._computeFrom(task);
    const to = this._computeTo(task);

    return html`
      <paper-dialog id='${dialogId}' with-backdrop @iron-overlay-closed='${this._overlayClosed}'>
        <h2 class='dialog-title'>${dialogTitle.toUpperCase()}</h2>
        <paper-input id='taskName' label='Task Name' value='${task.name}' @value-changed='${(e) => { this._nameChanged(e); }}'></paper-input>
        <div class='flex'>
          <paper-dropdown-menu label="Person">
            <paper-listbox slot="dropdown-content" attr-for-selected='key' selected='${person.id}' @selected-changed='${(e) => { this._personChanged(e); }}'>
              ${repeat(people, (item) => item.id, (item) => html`
                <paper-item key='${item.id}'>${item.name}</paper-item>
              `)}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class='flex'>
          <paper-dropdown-menu label="Project" >
            <paper-listbox slot="dropdown-content" attr-for-selected='key' selected='${project.id}'  @selected-changed='${(e) => { this._projectChanged(e); }}'>
            ${repeat(projects, (item) => item.id, (item) => html`
              <paper-item key='${item.id}'>${item.name}</paper-item>
            `)}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class='flex'>
          <vaadin-date-picker id='fromDate' label="FROM" value='${from}' @value-changed='${(e) => { this._fromChanged(e); }}'></vaadin-date-picker>
        </div>
        <div class='flex'>
          <vaadin-date-picker id='toDate' label="TO" value='${to}'  @value-changed='${(e) => { this._toChanged(e); }}'></vaadin-date-picker>
        </div>
        <div class="buttons">
          ${task.id ? html`<paper-icon-button icon='delete' class='delete-button' @click='${this._deleteClicked}}'></paper-icon-button>` : ''}
          <paper-button class='text-button' @click='${this._dismiss}'>Cancel</paper-button>
          <paper-button class='text-button' autofocus @click='${this._saveTask}'>Save Task</paper-button>
        </div>
      </paper-dialog>
    `;
  }

  static get styles() {
    return [
      SharedStyles,
      css`
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

      .delete-button {
        position: absolute;
        left: 24px;
        margin-top: -3px;
        color: #ec407a;
      }

      .text-button {
        --paper-button-ink-color: #3f51b5;
      }
      `,
    ];
  }
}

/* Register the new element with the browser */
window.customElements.define('task-dialog', TaskDialog);
