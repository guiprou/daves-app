import {
  GET_TASKS,
  GET_FILTER,
  SET_FILTER,
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
} from '../actions/tasks';

const tasks = (state = {
  tasks: [],
  filter: { minDate: moment().toDate(), maxDate: moment().toDate() },
  lastAddedTask: {},
  lastUpdatedTask: {},
  lastDeletedTask: {},
}, action) => {
  switch (action.type) {
    case GET_TASKS:
      return {
        ...state,
        tasks: action.tasks,
      };

    case GET_FILTER:
      return {
        ...state,
        filter: action.filter,
      };

    case SET_FILTER:
      return {
        ...state,
        filter: action.filter,
      };

    case ADD_TASK:
      return {
        ...state,
        lastAddedTask: action.task,
      };

    case UPDATE_TASK:
      return {
        ...state,
        lastUpdatedTask: action.task,
      };

    case DELETE_TASK:
      return {
        ...state,
        lastDeletedTask: action.task,
      };

    default:
      return state;
  }
};

export default tasks;
