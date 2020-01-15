import { setNotification } from './notification';

export const GET_TASKS = 'GET_TASKS';
export const GET_FILTER = 'GET_FILTER';
export const SET_FILTER = 'SET_FILTER';
export const ADD_TASK = 'ADD_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';

const Task = Parse.Object.extend('Task');

export const getTasks = () => async (dispatch, getState) => {
  const state = getState();
  const { tasksReducer: { filter } } = state;
  const tasksArray = [];
  const query = new Parse.Query(Task);
  query.greaterThanOrEqualTo('to', filter.minDate);
  query.lessThanOrEqualTo('from', filter.maxDate);
  try {
    const tasks = await query.find();
    if (tasks) {
      tasks.forEach((task) => {
        tasksArray.push({
          id: task.id,
          name: task.get('name'),
          projectId: task.get('projectId'),
          personId: task.get('personId'),
          from: task.get('from'),
          to: task.get('to'),
        });
      });
      dispatch({
        type: GET_TASKS,
        tasks: tasksArray,
      });
    } else {
      const level = 'error';
      const message = 'Could not find tasks.';
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } catch (error) {
    const level = 'error';
    const message = `Could not get tasks: ${error.cod} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const addTask = (name, projectId, personId, from, to) => async (dispatch) => {
  const newTask = new Task();
  if (name.length
    && projectId.length
    && personId.length
    && from.toString().toLowerCase() !== 'invalid date'
    && to.toString().toLowerCase() !== 'invalid date') {
    newTask.set('name', name);
    newTask.set('projectId', projectId);
    newTask.set('personId', personId);
    newTask.set('from', from);
    newTask.set('to', to);
    try {
      const object = await newTask.save();
      const task = {
        id: object.id,
        name: object.get('name'),
        projectId: object.get('projectId'),
        personId: object.get('personId'),
        from: object.get('from'),
        to: object.get('to'),
      };
      const level = 'success';
      const message = `${task.name.toUpperCase()} created successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: ADD_TASK,
        task,
      });
      dispatch(getTasks());
    } catch (error) {
      const level = 'error';
      const message = `Could not create task with name ${name.toUpperCase()}: ${error.code} ${error.message}`;
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } else {
    const level = 'warning';
    const message = 'Please, make sure fields are not empty.';
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const updateTask = (id, name, projectId, personId, from, to) => async (dispatch) => {
  const query = new Parse.Query(Task);
  if (name.length
    && projectId.length
    && personId.length
    && from.toString().toLowerCase() !== 'invalid date'
    && to.toString().toLowerCase() !== 'invalid date') {
    query.equalTo('objectId', id);
    try {
      const object = await query.first();
      object.set('name', name);
      object.set('projectId', projectId);
      object.set('personId', personId);
      object.set('from', from);
      object.set('to', to);
      await object.save();
      const task = {
        id,
        name: object.get('name'),
        projectId: object.get('projectId'),
        personId: object.get('personId'),
        from: object.get('from'),
        to: object.get('to'),
      };
      const level = 'success';
      const message = `${task.name.toUpperCase()} updated successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: UPDATE_TASK,
        task,
      });
      dispatch(getTasks());
    } catch (error) {
      const level = 'error';
      const message = `Could not update task with name ${name.toUpperCase()}: ${error.code} ${error.message}`;
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } else {
    const level = 'warning';
    const message = 'Please, make sure fields are not empty.';
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const deleteTask = (id) => async (dispatch) => {
  const query = new Parse.Query(Task);
  query.equalTo('objectId', id);
  try {
    const object = await query.first();
    if (object) {
      const response = await object.destroy();
      const task = {
        id,
        name: response.get('name'),
        projectId: response.get('projectId'),
        personId: response.get('personId'),
        from: response.get('from'),
        to: response.get('to'),
      };
      const level = 'success';
      const message = `${task.name.toUpperCase()} deleted successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: DELETE_TASK,
        task,
      });
      dispatch(getTasks());
    } else {
      const level = 'error';
      const message = 'Could not find task to delete.';
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } catch (error) {
    const level = 'error';
    const message = `Could not delete task: ${error.code} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const deleteProjectTasks = (projectId) => async (dispatch) => {
  const query = new Parse.Query(Task);
  query.equalTo('projectId', projectId);
  try {
    const results = await query.find();
    results.forEach((task) => {
      dispatch(deleteTask(task.id));
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletePersonTasks = (personId) => async (dispatch) => {
  const query = new Parse.Query(Task);
  query.equalTo('personId', personId);
  try {
    const results = await query.find();
    results.forEach((task) => {
      dispatch(deleteTask(task.id));
    });
  } catch (error) {
    console.log(error);
  }
};

export const setFilter = (filter) => (dispatch) => {
  dispatch({
    type: SET_FILTER,
    filter,
  });
};
