import { html } from '@polymer/lit-element';
import {repeat} from "lit-html/lib/repeat"
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

import '@polymer/google-chart/google-chart.js'
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';

import('./task-dialog.js');

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { getPeople } from '../actions/people.js';
import { getProjects } from '../actions/projects.js';
import { getTasks, setFilter, addTask, updateTask, deleteTask } from '../actions/tasks.js';
import { setNotification } from '../actions/notification.js';

/* Load shared styles. All view elements use these styles */
import { SharedStyles } from './shared-styles.js';

/* Extend the base PolymerElement class */
class Schedule extends connect(store)(PageViewElement) {
  _render(props) {

    var person = this._computePerson(props.people, props.taskToUpdate);
    var project = this._computeProject(props.projects, props.taskToUpdate);
    var from = this._computeFrom(props.taskToUpdate);
    var to = this._computeTo(props.taskToUpdate);

    let graphSection = html``,
        previousButton = html``,
        nextButton = html``,
        cardContent = html``;

      var loading = props.data == '';
      previousButton = html`
          <paper-icon-button slot="suffix" icon='chevron-left' on-click='${(e) => { this._decreaseFilter() }}'></paper-icon-button>
        `;
        nextButton = html`
          <paper-icon-button slot="suffix" icon='chevron-right' on-click='${(e) => { this._increaseFilter() }}'></paper-icon-button>
        `;

        var hidden = loading ? "visible" : "hidden"

        graphSection = html`
        <paper-card class="">
          <div class="card-content">
          <h1>
            ${previousButton}
            ${nextButton}
            ${moment(props.filter.minDate).format('MMMM YYYY').toUpperCase()} - ${moment(props.filter.maxDate).format('MMMM YYYY').toUpperCase()}
          </h1>
            <center><paper-spinner class$="${hidden}" active='${loading}'></paper-spinner></center>
            <google-chart id='timelineChart' type='timeline' data='${props.data}' on-google-chart-select='${(e) => { this._onChartSelect(e) }}' options='${props.options}' on-google-chart-ready='${(e) => { this._chartIsReady(e) }}'></google-chart>
          </div>
        </paper-card>
        `;

    if (this.taskToUpdate.id != '') {
      cardContent = html`
      <div role="listbox">
        <paper-item>
          <paper-item-body two-line>
            <div><b>${props.taskToUpdate.name.toUpperCase()}</b></div>
            <div secondary></div>
          </paper-item-body>
        </paper-item>
        <paper-icon-item>
          <iron-icon icon="social:person" slot="item-icon">
          </iron-icon>
          <paper-item-body two-line>
            <div>${person.name}</div>
            <div secondary>${person.title}</div>
          </paper-item-body>
        </paper-icon-item>
        <paper-icon-item>
            <iron-icon icon="icons:work" slot="item-icon">
            </iron-icon>
          <paper-item-body two-line>
            <div>${project.name}</div>
            <div secondary></div>
          </paper-item-body>
        </paper-icon-item>
        <paper-icon-item>
          <iron-icon icon="icons:date-range" slot="item-icon">
          </iron-icon>
          <paper-item-body two-line>
            <div>From</div>
            <div secondary>${from}</div>
          </paper-item-body>
          <paper-item-body two-line>
            <div>To</div>
            <div secondary>${to}</div>
          </paper-item-body>
        </paper-icon-item>
      </div>
      `;
    } else {
      cardContent = html`
      <paper-item>
        <paper-item-body two-line>
          <div><b>TASK DETAILS</b></div>
          <div secondary></div>
        </paper-item-body>
      </paper-item>
      <div class="no-task"><i>Please, Select a Task to see details...</i></div>`;
    }

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

        paper-dialog {
          padding: 15px;
          border-radius: 5px;
        }

        .details-container {
          margin: 30px 30px 0 0;
        }

        paper-card {
          z-index: 15;
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

        paper-card.task-details {
          position: sticky;
          top: 20px;
        }

        google-chart {
          width: 100%;
           /* max-height: 700px; */
          /* margin: 24px auto; */
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

        paper-fab.amber {
          --paper-fab-background: #ffb300;
          --paper-fab-keyboard-focus-background: #ffb300;
        }

        paper-fab.teal {
          --paper-fab-background: #009688;
          --paper-fab-keyboard-focus-background: #009688;
        }

        #addButton {
          position: fixed;
          bottom: 4.5rem;
          right: 85px;
        }

        /* #editButton {
          position: fixed;
          bottom: 2rem;
          right: 150px;
        } */

        /* #deleteButton {
          position: fixed;
          bottom: 2rem;
          right: 85px;
        } */

        #exportButton {
          position: fixed;
          bottom: 4.5rem;
          right: 20px;
        }



        h1 {
          width: 100%;
          margin: 0 0 16px 0 !important;
          color: var(--app-secondary-color);
          font-weight: 400;
        }

        .chart-container {
          min-height: 200px;
          height: 100%;
          margin: 30px 30px 0 0;
        }

        paper-spinner {
          /* margin: auto; */
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

       .flex9child {
         @apply(--layout-flex-9);
       }

       .flex3child {
         @apply(--layout-flex-3);
       }

       .card-actions {
         text-align: right;
       }

       paper-item,
       paper-icon-item {
        --paper-item-focused-before: {
           background: none;
         };
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
         margin: 40px;
       }

       #timelineChart {
         /* margin-bottom: 30px; */
       }

       @media (min-width: 1280px) {
         .flex {
           @apply --layout-horizontal;
         }
       }


      </style>
      <div id='container' class="flex">
        <div class="chart-container flex9child">
          ${graphSection}
        </div>
        <div class="details-container flex3child">
        <paper-card class="task-details">
          <div class="card-content">
            ${cardContent}
          </div>
          <div class="card-actions">
            <paper-button on-click='${(e) => { this._editClicked() }}'>Edit Task</paper-button>
            <paper-button on-click='${(e) => { this._deleteClicked() }}'>Delete Task</paper-button>
          </div>
        </paper-card>
      </div>

      </div>
        <paper-fab id='addButton' icon='add' class='blue' on-click='${(e) => { this._addTask() }}'></paper-fab>
        <paper-fab id='exportButton' icon='file-download' class='teal' on-click='${(e) => { this._exportTimeline() }}'></paper-fab>
        <paper-tooltip for="addButton" position="top" animation-delay="0">Add Task</paper-tooltip>
        <paper-tooltip for="exportButton" position="top" animation-delay="0">Export Chart</paper-tooltip>
        <task-dialog id='taskDialog' dialogTitle='${props.dialogTitle}' dialogId='taskDialog' people='${props.people}' projects='${props.projects}' task='${props.taskToUpdate}' on-save-task='${(e) => { this._onSaveTask(e) }}' on-notify='${(e) => { this._notify(e) }}' on-close-dialog='${(e) => { this._onCloseDialog(e) }}'></task-dialog>
        <paper-dialog id='deleteDialog' with-backdrop>
          <h2 class='dialog-title'>DELETE TASK</h2>
          <p>Delete ${props.taskToUpdate.name.toUpperCase()}?</p>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button autofocus on-click='${(e) => { store.dispatch(deleteTask(props.taskToUpdate.id)) }}'>Delete</paper-button>
          </div>
        </paper-dialog>

    `;
  }
  // <paper-fab id='deleteButton' icon='delete' class='red' on-click='${(e) => { this._deleteClicked() }}'></paper-fab>
// <paper-fab id='editButton' icon='create' class='amber' on-click='${(e) => { this._editClicked() }}'></paper-fab>
  static get properties() { return {
    options: Object,
    dialogTitle: String,
    data: Array,
    people: Array,
    projects: Array,
    tasks: Array,
    taskToUpdate: Object,
    lastAddedTask: Object,
    lastUpdatedTask: Object,
    lastDeletedTask: Object,
    filter: Object,
    rowNumber: Number
  }}

  constructor() {
    super();
    var me = this;
    this.options = {
      tooltip: { trigger: 'hover' },
      hAxis: {}
    };
    this.data = '';
    this.filter = {minDate: moment().toDate(), maxDate: moment().toDate()};
    this.dialogTitle = "",
    this.people = [];
    this.projects = [];
    this.tasks = [];
    this.taskToUpdate = {
      id: '',
      name: '',
      personId: '',
      projectId: '',
      from: '',
      to: ''
    };
    this.rowNumber = 0;
  }

  // This is called every time something is updated in the store.
  _stateChanged(state) {
    if (this.filter != state.tasksReducer.filter) {
      this.filter = state.tasksReducer.filter;
      this.options.hAxis.minValue = state.tasksReducer.filter.minDate;
      this.options.hAxis.maxValue = state.tasksReducer.filter.maxDate;
      // console.log(this.options.hAxis.minValue)
      if (moment(state.tasksReducer.filter.minDate).valueOf() != moment(state.tasksReducer.filter.maxDate).valueOf()) {
          store.dispatch(getTasks());
      }
    }

    if (this.people != state.peopleReducer.people || this.projects != state.projectsReducer.projects || this.tasks != state.tasksReducer.tasks) {
      this.people = state.peopleReducer.people;
      this.projects = state.projectsReducer.projects;
      this.tasks = state.tasksReducer.tasks;
      this._dataChanged(state.peopleReducer.people, state.projectsReducer.projects, state.tasksReducer.tasks);
    }
    if (this.lastAddedTask != state.tasksReducer.lastAddedTask) {
      this.lastAddedTask = state.tasksReducer.lastAddedTask;
        if (Object.keys(this.lastAddedTask).length > 0) {
          this._closeTaskDialog();
      }
    }

    if (this.lastUpdatedTask != state.tasksReducer.lastUpdatedTask) {
      this.lastUpdatedTask = state.tasksReducer.lastUpdatedTask;
        if (Object.keys(this.lastUpdatedTask).length > 0) {
          this._closeTaskDialog();
          this._initTaskToUpdate();
      }
    }

    if (this.lastDeletedTask != state.tasksReducer.lastDeletedTask) {
      this.lastDeletedTask = state.tasksReducer.lastDeletedTask;
        if (Object.keys(this.lastDeletedTask).length > 0) {
          this._closeDeleteDialog();
          this._initTaskToUpdate();
      }
    }
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

  _increaseFilter() {
    var minDate = moment(this.filter.minDate);
    var maxDate = moment(this.filter.maxDate);
    var min = minDate.clone().add(1, 'week');
    var max = maxDate.clone().add(1, 'week');
    store.dispatch(setFilter({
      minDate: min.toDate(),
      maxDate: max.toDate()
    }));
  }

  _decreaseFilter() {
    var minDate = moment(this.filter.minDate);
    var maxDate = moment(this.filter.maxDate);
    var min = minDate.clone().subtract(1, 'week');
    var max = maxDate.clone().subtract(1, 'week');
    store.dispatch(setFilter({
      minDate: min.toDate(),
      maxDate: max.toDate()
    }));
  }

  _firstRendered() {
    store.dispatch(getPeople());
    store.dispatch(getProjects());
    var now = moment().set({hour:0,minute:0,second:0,millisecond:0});
    store.dispatch(setFilter({
      minDate: now.toDate(),
      maxDate: now.add(1, 'months').toDate()
    }));
  }

  _dataChanged(people, projects, tasks) {
    // console.log(people);
    // console.log(projects);
    // console.log(tasks);
    var me = this;
    google.charts.load('current', {'packages':['timeline']});
    google.charts.setOnLoadCallback( function () {
      var dataTable = new google.visualization.DataTable();
      dataTable.addColumn({ type: 'string', id: 'Person' });
      dataTable.addColumn({ type: 'string', id: 'Project' });
      dataTable.addColumn({ type: 'string', role: 'tooltip'});
      dataTable.addColumn({ type: 'date', id: 'Start' });
      dataTable.addColumn({ type: 'date', id: 'End' });

      var rows = me._getTasksByPerson(people, projects, tasks);

      me.rowNumber = me._getRowNumber(rows);

      rows.forEach(function (row) {
        dataTable.addRow(row);
      });

      // me.data = dataTable;

      // if (dataTable.og.length > 0)  {
      //   me.data = dataTable;
      setTimeout(function() {
      //     var chart = me.shadowRoot.getElementById('timelineChart');
      //     if (chart != null) {
        me.data = dataTable;
      //       chart.data = dataTable;
      //     }
      }, 100);
      // }
    });

  }

  _getTasksByPerson(people, projects, tasks) {
    var array = [];
    var me = this;
    var filteredPerson = [];
    var filteredPeople = [];
    var filteredProjects = [];
    var missingPeople = [];

    // console.log(tasks);
    tasks.forEach(function (task) {

      filteredPerson = people.filter(function (person) {
        return task.personId == person.id;
      });

      filteredPeople.push(filteredPerson[0]);

      filteredProjects = projects.filter(function (project) {
        return task.projectId == project.id;
      });

      if (people.length > 0 && projects.length > 0) {
        var data = {
          person: filteredPerson[0],
          project: filteredProjects[0],
          task: task
        };
        var chartStart = task.from < me.filter.minDate ? me.filter.minDate : task.from;
        var chartEnd = task.to > me.filter.maxDate ? me.filter.maxDate : task.to;

        array.push([filteredPerson[0].name, filteredProjects[0].name, JSON.stringify(data), chartStart, chartEnd]);
      }
    });

    missingPeople = people.filter(function(item) {
      return !filteredPeople.some(function(other) {
        return item.id === other.id;
      });
    })

    missingPeople.forEach(function (person) {
      array.push([person.name, null, null, me.filter.minDate, me.filter.minDate]);
    });

    array = array.sort(function (a, b) {
      if (a[0].toLowerCase() === b[0].toLowerCase()) {
        return 0;
      }
      else {
        return (a[0].toLowerCase() < b[0].toLowerCase()) ? -1 : 1;
      }
    });

    return array;
  }

  _getRowNumber(rows) {
    // clone array
    var myArray = JSON.parse(JSON.stringify(rows));

    // remove attributes not usefyul for filtering and stringify objects
     myArray.forEach(function(item, index) {
      delete item[2];
      delete item[3];
      delete item[4];
      myArray[index] = JSON.stringify(item);
    });

    // remove duplicates
    var filteredRows = myArray.filter(function(item, index) {
      return myArray.indexOf(item) >= index;
    });
    return filteredRows.length;
  }

  _chartIsReady (e) {
      this.chart = e.detail.chart;
    var chart = this.shadowRoot.getElementById('timelineChart');
    var numRows = this.rowNumber;

      var expectedHeight = numRows * 42 + 50;

      if (parseInt(chart.options.height, 10) != expectedHeight) {
        // Update the chart options and redraw just it
        // expectedHeight = expectedHeight > 600 ? 600 : expectedHeight;
        chart.setAttribute("style","height:" + parseInt(expectedHeight) + 'px');
        chart.options.height = expectedHeight;
        chart.redraw();
      }
      var el= e.detail.chart.container.getElementsByTagName("rect");  //get all the descendant rect element inside the container
      var width=100000000;                                //set a large initial value to width
      var elToRem=[];                                     //element would be added to this array for removal
      for(var i=0;i<el.length;i++){                           //looping over all the rect element of container
          var cwidth=parseInt(el[i].getAttribute("width"));//getting the width of ith element
          if(cwidth<width){                               //if current element width is less than previous width then this is min. width and ith element should be removed
              elToRem=[el[i]];
              width=cwidth;                               //setting the width with min width
          }
          else if(cwidth==width){                         //if current element width is equal to previous width then more that one element would be removed
              elToRem.push(el[i]);
          }
      }
      for(var i=0;i<elToRem.length;i++) { // now iterate JUST the elements to remove
          elToRem[i].setAttribute("fill","none"); //make invisible all the rect element which has minimum width
      }
  }

  _initTaskToUpdate() {
    var task = {
      id: '',
      name: '',
      personId: '',
      projectId: '',
      from: '',
      to: ''
    };
    this.taskToUpdate = task;
  }

  _addTask(task) {
    this._initTaskToUpdate();
    this.dialogTitle = 'create task';
    this._openTaskDialog();
  }

  _editClicked() {
    if (this.taskToUpdate.id != '') {
      this.dialogTitle = 'edit task';
      this._openTaskDialog();
    } else {
      var level = 'warning';
      var message = 'Please, select a task to update.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      store.dispatch(setNotification(level, message));
    }
  }

  _deleteClicked() {
    if (this.taskToUpdate.id != '') {
      this._openDeleteDialog();
    } else {
      var level = 'warning';
      var message = 'Please, select a task to delete.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      store.dispatch(setNotification(level, message));
    }
  }

  _exportTimeline() {
    var filename = moment(this.filter.minDate).format('YYYYMMDD') + '-' + moment(this.filter.maxDate).format('YYYYMMDD');
    var svg = this.chart.container.getElementsByTagName('svg')[0].cloneNode(true);
    saveSvgAsPng(svg, filename + ".png");
 }

 outerHTML(el) {
  var outer = document.createElement('div');
  outer.appendChild(el.cloneNode(true));
  return outer.innerHTML;
}

  _onChartSelect(e) {
    var me = this;
    setTimeout(function() {
      var chart = me.shadowRoot.getElementById('timelineChart');
      if (chart.selection != undefined && chart.selection[0].row != null) {
        var data = JSON.parse(me.data.getValue(chart.selection[0].row, 2));
        if (data != null ) {
          me.taskToUpdate = data.task;
        }
      }
    }, 100);

  }

  _onSaveTask(e) {
    var task = e.detail.task;
    if (task.id != '') {
      // this._updateTask(task);
      store.dispatch(updateTask(task.id, task.name, task.projectId, task.personId, task.from, task.to))
    } else {
      // this._createTask(task);
      store.dispatch(addTask(task.name, task.projectId, task.personId, task.from, task.to))
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
    // this.dispatchEvent(new CustomEvent('notify', {detail: {level: e.detail.level, message: e.detail.message}}));
  }

  _onCloseDialog(e) {
    this.shadowRoot.getElementById('timelineChart').selection = [];
  }
}

/* Register the new element with the browser */
window.customElements.define('schedule-view', Schedule);
