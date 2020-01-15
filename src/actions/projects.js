import { setNotification } from './notification';
import { deleteProjectTasks } from './tasks';

export const GET_PROJECTS = 'GET_PROJECTS';
export const ADD_PROJECT = 'ADD_PROJECT';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const DELETE_PROJECT = 'DELETE_PROJECT';

const Project = Parse.Object.extend('Project');

export const getProjects = () => async (dispatch) => {
  const query = new Parse.Query(Project);
  const projectsArray = [];
  query.ascending('name');
  try {
    const projects = await query.find();
    if (projects) {
      projects.forEach((project) => {
        projectsArray.push({
          id: project.id,
          name: project.get('name'),
        });
      });
      dispatch({
        type: GET_PROJECTS,
        projects: projectsArray,
      });
    } else {
      const level = 'error';
      const message = 'Could not find projects.';
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } catch (error) {
    const level = 'error';
    const message = `Could not get projects: ${error.code} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const addProject = (name) => async (dispatch) => {
  const newProject = new Project();
  if (name.length) {
    newProject.set('name', name);
    try {
      const object = await newProject.save();
      const project = {
        id: object.id,
        name: object.get('name'),
      };
      const level = 'success';
      const message = `${project.name.toUpperCase()} created successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: ADD_PROJECT,
        project,
      });
      dispatch(getProjects());
    } catch (error) {
      const level = 'error';
      const message = `Could not create Project with name ${name.toUpperCase()}: ${error.code} ${error.message}`;
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } else {
    const level = 'warning';
    const message = 'Please, make sure Name input is not empty';
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const updateProject = (id, name) => async (dispatch) => {
  if (name) {
    const query = new Parse.Query(Project);
    query.equalTo('objectId', id);
    try {
      const object = await query.first();
      object.set('name', name);
      await object.save();
      const project = {
        id,
        name: object.get('name'),
      };
      const level = 'success';
      const message = `${project.name.toUpperCase()} updated successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: UPDATE_PROJECT,
        project,
      });
      dispatch(getProjects());
    } catch (error) {
      const level = 'error';
      const message = `Could not update project with ${name.toUpperCase()}: ${error.code} ${error.message}`;
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } else {
    const level = 'warning';
    const message = 'Please, make sure Name input is not empty';
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const deleteProject = (id) => async (dispatch) => {
  const query = new Parse.Query(Project);
  query.equalTo('objectId', id);
  try {
    const object = await query.first();
    if (object) {
      const response = await object.destroy();
      const project = {
        id,
        name: response.get('name'),
      };
      const level = 'success';
      const message = `${project.name.toUpperCase()} deleted successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: DELETE_PROJECT,
        project,
      });
      dispatch(deleteProjectTasks(id));
      dispatch(getProjects());
    } else {
      const level = 'error';
      const message = 'Could not find project to delete.';
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } catch (error) {
    const level = 'error';
    const message = `Could not delete project: ${error.code} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};
