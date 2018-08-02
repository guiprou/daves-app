export const GET_PROJECTS = 'GET_PROJECTS';
export const ADD_PROJECT = 'ADD_PROJECT';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const DELETE_PROJECT = 'DELETE_PROJECT';

import { setNotification } from './notification.js';
import { deleteProjectTasks } from './tasks.js';

const Project = Parse.Object.extend("Project");

export const getProjects = () => (dispatch, getState) => {
  const state = getState();

  var query = new Parse.Query(Project);
  var projects_array = [];
  query.ascending('name');
  query.find({
    success: function (projects) {
      if (projects) {
        projects.forEach(function (project) {
          projects_array.push({
            id: project.id,
            name: project.get("name")
          });
        });

        dispatch({
          type: GET_PROJECTS,
          projects: projects_array
        });

      } else {
        var level = 'error';
        var message = 'Could not find projects.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
      }
    },
    error: function (error) {
      var level = 'error';
      var message = 'Could not get projects: ' + error.code + " " + error.message;
      // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      dispatch(setNotification(level, message));
      console.log(message);
    }
  });
};

export const addProject = (name) => (dispatch, getState) => {
  const state = getState();

  var newProject = new Project();

  if (name.length > 0) {
    newProject.set("name", name);

    newProject.save(null, {
      success: function (object) {

        var project = {
          id: object.id,
          name: object.get("name")
        };

        var level = 'success';
        var message = project.name.toUpperCase() + ' created successfully.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));

        dispatch({
          type: ADD_PROJECT,
          project: project
        });

        dispatch(getProjects());
      },
      error: function (response, error) {
        var level = 'error';
        var message = 'Could not create Project with name ' + name.toUpperCase() + ': ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
      }
    });
  } else {
    var level = 'warning';
    var message = 'Please, make sure Name input is not empty';
    // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
    dispatch(setNotification(level, message));
    console.log(message);
  }
}

export const updateProject = (id, name) => (dispatch, getState) => {
  const state = getState();

  if (name != '') {
    var query = new Parse.Query(Project);
    query.equalTo("objectId", id);
    query.first({
      success: function(object) {
        object.set('name', name);
        object.save();

        var project = {
          id: id,
          name: object.get("name")
        };

        var level = 'success';
        var message = project.name.toUpperCase() + ' updated successfully.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        // me._closeEditDialog();
        // me.refresh();
        dispatch({
          type: UPDATE_PROJECT,
          project: project
        });

        dispatch(getProjects());
      },

      error: function(error) {
        var level = 'error';
          var message = 'Could not update project with name ' + project.name.toUpperCase() + ': ' + error.code + " " + error.message;
          // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
          dispatch(setNotification(level, message));
          console.log(message);
        }
      });
    } else {
      var level = 'warning';
      var message = 'Please, make sure Name input is not empty';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      dispatch(setNotification(level, message));
      console.log(message);
    }
  }


  export const deleteProject = (id) => (dispatch, getState) => {
    const state = getState();

    var query = new Parse.Query(Project);
    query.equalTo("objectId", id);
    query.first({
      success: function (object) {
        if (object) {
          object.destroy({
            success: function(response) {

              var project = {
                id: id,
                name: response.get("name")
              };

              var level = 'success';
              var message = project.name.toUpperCase() + ' deleted successfully.';
              // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
              dispatch(setNotification(level, message));

              dispatch({
                type: DELETE_PROJECT,
                project: project
              });

              dispatch(deleteProjectTasks(id));
              dispatch(getProjects());
            },
            error: function(response, error) {
              var level = 'error';
              var message = 'Could not delete project with name ' + project.name.toUpperCase() + ': ' + error.code + " " + error.message;
              // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
              dispatch(setNotification(level, message));
              console.log(message);
            }
          });
        } else {
          var level = 'error';
          var message = 'Could not find project to delete.';
          // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
          dispatch(setNotification(level, message));
          console.log(message);
          return null;
        }
      },
      error: function (error) {
        var level = 'error';
        var message = 'Could not find project to delete: ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
        return null;
      }
    });
  }
