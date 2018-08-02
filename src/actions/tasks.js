export const GET_TASKS = 'GET_TASKS';
export const GET_FILTER = 'GET_FILTER';
export const SET_FILTER = 'SET_FILTER';
export const ADD_TASK = 'ADD_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';

import { setNotification } from './notification.js';

const Task = Parse.Object.extend("Task");

export const getTasks = () => (dispatch, getState) => {
  const state = getState();
  var filter = state.tasksReducer.filter;
  var tasks_array = [];
  var query = new Parse.Query(Task);
  query.greaterThanOrEqualTo("to", filter.minDate);
  query.lessThanOrEqualTo("from", filter.maxDate);
  query.find().then(function(tasks) {
    // console.log(filter.minDate);
    // console.log(filter.maxDate);
    // console.log(tasks);
    if (tasks) {
        tasks.forEach(function (task) {
          tasks_array.push({
            id: task.id,
            name: task.get("name"),
            projectId: task.get("projectId"),
            personId: task.get("personId"),
            from: task.get("from"),
            to: task.get("to")
          });
        });
        dispatch({
          type: GET_TASKS,
          tasks: tasks_array
        });


      } else {
        var level = 'error';
        var message = 'Could not find tasks.';
        dispatch(setNotification(level, message));
        console.log(message);
      }
    })
  .catch(function(error) {
    var level = 'error';
    var message = 'Could not get tasks: ' + error.code + " " + error.message;
    // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
    dispatch(setNotification(level, message));
    console.log(message);
  });;
};

export const addTask = (name, projectId, personId, from, to) => (dispatch, getState) => {
  const state = getState();

  var newTask = new Task();

  if (name.length > 0 && projectId.length > 0 && personId.length > 0 && from.toString().toLowerCase() != "invalid date" && to.toString().toLowerCase() != "invalid date") {
    newTask.set("name", name);
    newTask.set("projectId", projectId);
    newTask.set("personId", personId);
    newTask.set("from", from);
    newTask.set("to", to);

    newTask.save(null, {
      success: function (object) {

        var task = {
          id: object.id,
          name: object.get("name"),
          projectId: object.get("projectId"),
          personId: object.get("personId"),
          from: object.get("from"),
          to: object.get("to"),
        };

        var level = 'success';
        var message = task.name.toUpperCase() + ' created successfully.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));

        dispatch({
          type: ADD_TASK,
          task: task
        });

        dispatch(getTasks());
      },
      error: function (response, error) {
        var level = 'error';
        var message = 'Could not create task with name ' + name.toUpperCase() + ': ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
      }
    });
  } else {
    var level = 'warning';
    var message = 'Please, make sure fields are not empty.';
    // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
    dispatch(setNotification(level, message));
      console.log(message);
    dispatch(setNotification({
      level: level,
      message: message
    }));
  }
}

export const updateTask = (id, name, projectId, personId, from, to) => (dispatch, getState) => {
  const state = getState();

  var query = new Parse.Query(Task);
  if (name.length > 0 && projectId.length > 0 && personId.length > 0 && from.toString().toLowerCase() != "invalid date" && to.toString().toLowerCase() != "invalid date") {

    query.equalTo("objectId", id);
    query.first({
      success: function(object) {
        object.set("name", name);
        object.set("projectId", projectId);
        object.set("personId", personId);
        object.set("from", from);
        object.set("to", to);
        object.save();

        var task = {
          id: id,
          name: object.get("name"),
          projectId: object.get("projectId"),
          personId: object.get("personId"),
          from: object.get("from"),
          to: object.get("to")
        };

        var level = 'success';
        var message = task.name.toUpperCase() + ' updated successfully.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));

        dispatch({
          type: UPDATE_TASK,
          task: task
        });

        dispatch(getTasks());

      },
      error: function(error) {
        var level = 'error';
        var message = 'Could not update task with name ' + name.toUpperCase() + ': ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
      }
    });
  } else {
      var level = 'warning';
      var message = 'Please, make sure fields are not empty.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      dispatch(setNotification(level, message));
      console.log(message);
    }
  }


  export const deleteTask = (id) => (dispatch, getState) => {
    const state = getState();

    var query = new Parse.Query(Task);

    query.equalTo("objectId", id);
    query.first({
      success: function (object) {
        if (object) {
          object.destroy({
            success: function(response) {

              var task = {
                id: id,
                name: response.get("name"),
                projectId: response.get("projectId"),
                personId: response.get("personId"),
                from: response.get("from"),
                to: response.get("to")
              };

              var level = 'success';
              var message = task.name.toUpperCase() + ' deleted successfully.';
              // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
              dispatch(setNotification(level, message));

              dispatch({
                type: DELETE_TASK,
                task: task
              });

              dispatch(getTasks());
            },
            error: function(response, error) {
              var level = 'error';
              var message = 'Could not delete task with name ' + task.name.toUpperCase() + ': ' + error.code + " " + error.message;
              // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
              dispatch(setNotification(level, message));
              console.log(message);
            }
          });
        } else {
          var level = 'error';
          var message = 'Could not find task to delete.';
          // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
          dispatch(setNotification(level, message));
          console.log(message);
          return null;
        }
      },
      error: function (error) {
        var level = 'error';
        var message = 'Could not find task to delete: ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
        return null;
      }
    });
  }

  export const deleteProjectTasks = (projectId) => (dispatch, getState) => {
    const state= getState();

    var query = new Parse.Query(Task);
    query.equalTo('projectId', projectId);
    query.find({
      success: function(results) {
        console.log(results);
        results.forEach(function(task) {
          dispatch(deleteTask(task.id));
        });
      },
      error: function (error) {
        console.log(error);
      }
    });
  }

  export const deletePersonTasks = (personId) => (dispatch, getState) => {
    const state= getState();

    var query = new Parse.Query(Task);
    query.equalTo('personId', personId);
    query.find({
      success: function(results) {
        console.log(results);
        results.forEach(function(task) {
          dispatch(deleteTask(task.id));
        });
      },
      error: function (error) {
        console.log(error);
      }
    });
  }

  export const setFilter = (filter) => (dispatch, getState) => {
    const state = getState();

    dispatch({
      type: SET_FILTER,
      filter: filter
    });
  }
