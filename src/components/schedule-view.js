import { html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import '@google-web-components/google-chart/google-chart';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/social-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-spinner/paper-spinner';
import '@vaadin/vaadin-date-picker/vaadin-date-picker';
import PageViewElement from './page-view-element';
import './task-dialog';
import './chart-controls';
import { store } from '../store';
import { getPeople } from '../actions/people';
import { getProjects } from '../actions/projects';
import {
  getTasks,
  setFilter,
  addTask,
  updateTask,
  deleteTask,
} from '../actions/tasks';
import { setNotification } from '../actions/notification';
import { SharedStyles } from './shared-styles';

/* Extend the base PolymerElement class */
class Schedule extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      options: Object,
      dialogTitle: String,
      data: Object,
      people: Array,
      projects: Array,
      tasks: Array,
      taskToUpdate: Object,
      lastAddedTask: Object,
      lastUpdatedTask: Object,
      lastDeletedTask: Object,
      filter: Object,
      rowNumber: Number,
    };
  }

  constructor() {
    super();
    this.options = {
      tooltip: {
        isHtml: true,
        trigger: 'hover',
      },
      hAxis: {},
    };
    this.data = null;
    this.filter = {
      minDate: moment().toDate(),
      maxDate: moment().toDate(),
    };
    this.dialogTitle = '';
    this.people = [];
    this.projects = [];
    this.tasks = [];
    this.taskToUpdate = {
      id: '',
      name: '',
      personId: '',
      projectId: '',
      from: '',
      to: '',
    };
    this.rowNumber = 0;
  }

  firstUpdated() {
    store.dispatch(getPeople());
    store.dispatch(getProjects());
    this._setPeriod();
  }

  stateChanged(state) {
    const {
      tasksReducer: {
        filter: reducerFilter,
        lastAddedTask: reducerLastAddedTask,
        lastUpdatedTask: reducerLastUpdatedTask,
        lastDeletedTask: reducerLastDeletedTask,
      },
      peopleReducer: { people: reducerPeople },
      projectsReducer: { projects: reducerProjects },
      tasksReducer: { tasks: reducerTasks },
    } = state;

    if (this.filter !== reducerFilter) {
      this.filter = reducerFilter;
      this.options.hAxis.minValue = reducerFilter.minDate;
      this.options.hAxis.maxValue = reducerFilter.maxDate;
      if (moment(reducerFilter.minDate).valueOf() !== moment(reducerFilter.maxDate).valueOf()) {
        store.dispatch(getTasks());
      }
    }

    if (this.people !== reducerPeople && reducerPeople.length) {
      this.people = reducerPeople;
      this._dataChanged(reducerPeople, this.projects, this.tasks);
    }

    if (this.projects !== reducerProjects && reducerProjects.length) {
      this.projects = reducerProjects;
      this._dataChanged(this.people, reducerProjects, this.tasks);
    }

    if (this.tasks !== reducerTasks && reducerTasks.length) {
      this.tasks = reducerTasks;
      this._dataChanged(this.people, this.projects, reducerTasks);
    }

    if (this.lastAddedTask !== reducerLastAddedTask) {
      this.lastAddedTask = reducerLastAddedTask;
      if (Object.keys(this.lastAddedTask).length) {
        this._closeTaskDialog();
      }
    }

    if (this.lastUpdatedTask !== reducerLastUpdatedTask) {
      this.lastUpdatedTask = reducerLastUpdatedTask;
      if (Object.keys(this.lastUpdatedTask).length) {
        this._closeTaskDialog();
        this._initTaskToUpdate();
      }
    }

    if (this.lastDeletedTask !== reducerLastDeletedTask) {
      this.lastDeletedTask = reducerLastDeletedTask;
      if (Object.keys(this.lastDeletedTask).length) {
        this._closeDeleteDialog();
        this._closeTaskDialog();
        this._initTaskToUpdate();
      }
    }
  }

  _setPeriod() {
    const { screen: { width } } = window;
    const now = moment().set({
      hour: 0, minute: 0, second: 0, millisecond: 0,
    });
    let period = 4;
    if (width < 1000) {
      period = 1;
    } else if (width < 1400) {
      period = 2;
    } else if (width < 1800) {
      period = 3;
    }
    store.dispatch(setFilter({
      minDate: now.toDate(),
      maxDate: now.add(period, 'weeks').toDate(),
    }));
  }

  _computePerson(people, task) {
    return task.personId ? people.find((p) => (task.personId === p.id)) : {};
  }

  _computeProject(projects, task) {
    return task.projectId ? projects.find((p) => (task.projectId === p.id)) : {};
  }

  _computeFrom(task) {
    return task.from ? moment(task.from).format('YYYY-MM-DD') : '';
  }

  _computeTo(task) {
    return task.to ? moment(task.to).format('YYYY-MM-DD') : '';
  }

  _increaseFilter() {
    const { filter } = this;
    const minDate = moment(filter.minDate).clone().add(1, 'week').toDate();
    const maxDate = moment(filter.maxDate).clone().add(1, 'week').toDate();
    store.dispatch(setFilter({
      minDate,
      maxDate,
    }));
  }

  _decreaseFilter() {
    const { filter } = this;
    const minDate = moment(filter.minDate).clone().subtract(1, 'week').toDate();
    const maxDate = moment(filter.maxDate).clone().subtract(1, 'week').toDate();
    store.dispatch(setFilter({
      minDate,
      maxDate,
    }));
  }

  _dataChanged(people, projects, tasks) {
    if (people.length && projects.length && tasks.length) {
      google.charts.load('current', { packages: ['timeline'] });
      google.charts.setOnLoadCallback(() => {
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'string', id: 'Person' });
        dataTable.addColumn({ type: 'string', id: 'Project' });
        dataTable.addColumn({ type: 'string', role: 'tooltip' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });
        const rows = this._getTasksByPerson(people, projects, tasks);
        rows.forEach((row) => {
          dataTable.addRow(row);
        });
        this.data = dataTable;
      });
    }
  }

  _getTasksByPerson(people, projects, tasks) {
    const { filter } = this;
    const filteredPeople = [];

    const array = tasks.reduce((total, task) => {
      const person = people.find((p) => (task.personId === p.id));
      filteredPeople.push(person);
      const project = projects.find((p) => (task.projectId === p.id));
      if (person && project) {
        const chartStart = task.from < filter.minDate ? filter.minDate : task.from;
        const chartEnd = task.to > filter.maxDate ? filter.maxDate : task.to;
        total.push([
          person.name,
          project.name,
          JSON.stringify({ person, project, task }),
          chartStart,
          chartEnd,
        ]);
      }
      return total;
    }, []);

    const missingPeople = people.filter((p) => (
      !filteredPeople.some((other) => (p.id === other.id))
    ));

    const emptyTasks = missingPeople.reduce((total, p) => {
      const emptyTask = [p.name, null, null, filter.minDate, filter.minDate];
      total.push(emptyTask);
      return total;
    }, []);

    const fullArray = [
      ...array,
      ...emptyTasks,
    ];

    return fullArray.sort((a, b) => {
      if (a[0].toLowerCase() === b[0].toLowerCase()) {
        return 0;
      }
      return (a[0].toLowerCase() < b[0].toLowerCase()) ? -1 : 1;
    });
  }

  _chartIsReady(e) {
    this.chart = e.detail.chart;
    const el = e.detail.chart.container.getElementsByTagName('rect'); // get all the descendant rect element inside the container
    let width = 100000000; // set a large initial value to width
    let elToRem = []; // element would be added to this array for removal
    for (let i = 0; i < el.length; i++) { // looping over all the rect element of container
      const cwidth = parseInt(el[i].getAttribute('width')); // getting the width of ith element
      // if current element width is less than previous width
      // then this is min. width and ith element should be removed
      if (cwidth < width) {
        elToRem = [el[i]];
        width = cwidth; // setting the width with min width
      // if current element width is equal to previous width
      // then more that one element would be removed
      } else if (cwidth === width) {
        elToRem.push(el[i]);
      }
    }
    for (let i = 0; i < elToRem.length; i++) { // now iterate JUST the elements to remove
      elToRem[i].setAttribute('fill', 'none'); // make invisible all the rect element which has minimum width
    }
    this._moveXBarToTop();
  }

  _moveXBarToTop() {
    const { chart: { container: chartContainer } } = this;
    let g = chartContainer.getElementsByTagName('svg')[0].getElementsByTagName('g')[0];
    chartContainer.getElementsByTagName('svg')[0].parentNode.style.top = '40px';
    chartContainer.getElementsByTagName('svg')[0].style.overflow = 'visible';
    const height = Number(g.getElementsByTagName('text')[0].getAttribute('y')) + 25;
    g.setAttribute('transform', `translate(0, -${height})`);
    g = null;
  }

  _initTaskToUpdate() {
    const task = {
      id: '',
      name: '',
      personId: '',
      projectId: '',
      from: '',
      to: '',
    };
    this.taskToUpdate = task;
  }

  _addTask() {
    this._initTaskToUpdate();
    this.dialogTitle = 'create task';
    this._openTaskDialog();
  }

  _editClicked() {
    if (this.taskToUpdate.id !== '') {
      this.dialogTitle = 'edit task';
      this._openTaskDialog();
    } else {
      const level = 'warning';
      const message = 'Please, select a task to update.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      store.dispatch(setNotification(level, message));
    }
  }

  _deleteClicked() {
    if (this.taskToUpdate.id !== '') {
      this._openDeleteDialog();
    } else {
      const level = 'warning';
      const message = 'Please, select a task to delete.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      store.dispatch(setNotification(level, message));
    }
  }

  _confirmDelete() {
    const { taskToUpdate: { id } } = this;
    store.dispatch(deleteTask(id));
  }

  _downloadChart() {
    const { chart: { container: chartContainer } } = this;
    const filename = `${moment(this.filter.minDate).format('YYYYMMDD')}-${moment(this.filter.maxDate).format('YYYYMMDD')}`;
    const svg = chartContainer.getElementsByTagName('svg')[1].cloneNode(true);
    saveSvgAsPng(svg, `${filename}.png`);
  }

  outerHTML(el) {
    const outer = document.createElement('div');
    outer.appendChild(el.cloneNode(true));
    return outer.innerHTML;
  }

  _onChartSelect() {
    setTimeout(() => {
      const chart = this.shadowRoot.getElementById('timelineChart');
      if (chart.selection && chart.selection[0].row) {
        const data = JSON.parse(this.data.getValue(chart.selection[0].row, 2));
        if (data !== null) {
          this.taskToUpdate = { ...data.task };
        }
        this._editClicked();
      }
    }, 100);
  }

  _onSaveTask(e) {
    const { detail: { task } } = e;
    if (task.id) {
      store.dispatch(
        updateTask(task.id, task.name, task.projectId, task.personId, task.from, task.to),
      );
    } else {
      store.dispatch(addTask(task.name, task.projectId, task.personId, task.from, task.to));
    }
  }

  _openTaskDialog() {
    this.shadowRoot.getElementById('taskDialog').open();
  }

  _openDeleteDialog() {
    this.shadowRoot.getElementById('deleteDialog').open();
  }

  _closeTaskDialog() {
    this.shadowRoot.getElementById('taskDialog').close();
  }

  _closeDeleteDialog() {
    this.shadowRoot.getElementById('deleteDialog').close();
  }

  refresh() {
    this._getPeople();
    this._getProjects();
    this._initTaskToUpdate();
  }

  _notify(e) {
    store.dispatch(setNotification(e.detail.level, e.detail.message));
  }

  _onCloseDialog() {
    this.shadowRoot.getElementById('timelineChart').selection = [];
  }

  render() {
    const {
      people,
      projects,
      taskToUpdate,
      data,
      filter,
      options,
      dialogTitle,
    } = this;

    let graphSection = html``;
    const empty = data === null;

    graphSection = html`
      <div class="schedule-graph-card__content">
        ${empty ? html`<center><paper-spinner class="schedule-graph-card__content__spinner" .active=${empty}></paper-spinner></center>` : ''}
        ${!empty ? html`<google-chart class="schedule-graph-card__content__chart" id='timelineChart' type='timeline' .data='${data}' @google-chart-select='${(e) => { this._onChartSelect(e); }}' .options='${options}' @google-chart-ready='${(e) => { this._chartIsReady(e); }}'></google-chart>` : ''}
      </div>
    `;

    return html`
      <div id='container' class="page-container">
        <div class="chart-container">
          ${graphSection}
        </div>
        <chart-controls
          minDate='${moment(filter.minDate).format('MMM YYYY')}'
          maxDate='${moment(filter.maxDate).format('MMM YYYY')}'
          @add-task='${this._addTask}'
          @download-chart='${this._downloadChart}'
          @increase='${this._increaseFilter}'
          @decrease='${this._decreaseFilter}'
        ></chart-controls>

        <task-dialog
          id='taskDialog'
          dialogTitle='${dialogTitle}'
          dialogId='taskDialog'
          .people='${people}'
          .projects='${projects}'
          .task='${taskToUpdate}'
          @save-task='${(e) => { this._onSaveTask(e); }}'
          @delete-task='${this._deleteClicked}'
          @notify='${(e) => { this._notify(e); }}'
          @close-dialog='${(e) => { this._onCloseDialog(e); }}'
        ></task-dialog>

        <paper-dialog id='deleteDialog'>
          <h2 class='dialog-title'>DELETE TASK</h2>
          <p>Delete ${taskToUpdate.name.toUpperCase()}?</p>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus @click='${this._confirmDelete}'>Delete</paper-button>
          </div>
        </paper-dialog>
    `;
  }

  static get styles() {
    return [
      SharedStyles,
      css`
      :host {
          display: block;
          height: stretch;
        }

        .page-container {
          height: calc(100% - 32px);
        }

        paper-dialog {
          padding: 15px;
          border-radius: 5px;
        }

        .schedule-graph-card {
          height: 100%;
        }

        .schedule-graph-card__content {
          height: 100%;
          padding: 16px;
          /* display: grid;
          grid-template-rows: auto 1fr; */
        }

        .schedule-graph-card__content__spinner {
          position: relative;
          top: 50%;
          transform: translateY(-50%);
        }

        .schedule-graph-card__content__chart {
          height: 100%;
        }

        #chartdiv {
          height: 100%;
        }

        google-chart {
          width: 100%;
           /* max-height: 700px; */
          /* margin: 24px auto; */
        }

        #addButton {
          position: fixed;
          bottom: 24px;
          right: 85px;
        }

        #exportButton {
          position: fixed;
          bottom: 24px;
          right: 20px;
        }

        h1 {
          width: 100%;
          margin: 0 0 16px 0 !important;
          color: var(--app-secondary-color);
          font-weight: 400;
        }

        .chart-container {
          height: 100%;
          display: inline;
          /* grid-row: 1; */
        }

        paper-spinner {
          /* auto; */
        }

        .date-label {
          width: 80px;
          position:relative
        }

        .date-label>span {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
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

       .card-actions {
         text-align: right;
       }

       .no-task {
          margin-left: 16px;
       }

       paper-icon-button:not(:hover) {
         opacity: 0.7;
       }

       paper-icon-button {
         width: 45px;
         height: 45px;
         --paper-icon-button-hover: {
           border-radius: 10px;
           /* background-color: #dddddd; */
           opacity: 1;
         }
       }

       paper-spinner.hidden {
         height: 0;
       }

       paper-spinner.visible {
         40px;
       }

       #timelineChart {
         /* margin-bottom: 30px; */
       }

       @media (min-width: 400px) {
       }

       @media (min-width: 600px) {
       }

       @media (min-width: 1000px) {
       }

       @media (min-width: 1200px) {
       }

       @media (min-width: 1500px) {
       }

       @media (min-width: 1800px) {
       }
      }`,
    ];
  }
}

/* Register the new element with the browser */
window.customElements.define('schedule-view', Schedule);
