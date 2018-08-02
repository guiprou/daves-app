import { GET_PROJECTS, ADD_PROJECT, UPDATE_PROJECT, DELETE_PROJECT } from '../actions/projects.js';

const projects = (state = {projects: [], lastAddedProject: {}, lastUpdatedProject: {}, lastDeletedProject: {}}, action) => {
  switch (action.type) {
    case GET_PROJECTS:
      return {
        ...state,
        projects: action.projects
      };

    case ADD_PROJECT:
      return {
        ...state,
        lastAddedProject: action.project
      };

    case UPDATE_PROJECT:
      return {
        ...state,
        lastUpdatedProject: action.project
      };

    case DELETE_PROJECT:
      return {
        ...state,
        lastDeletedProject: action.project
      };

    default:
      return state;
  }
}

export default projects;
