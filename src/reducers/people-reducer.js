import { GET_PEOPLE, ADD_PERSON, UPDATE_PERSON, DELETE_PERSON } from '../actions/people.js';

const people = (state = {people: [], lastAddedPerson: {}, lastUpdatedPerson: {}, lastDeletedPerson: {}}, action) => {
  switch (action.type) {
    case GET_PEOPLE:
      return {
        ...state,
        people: action.people
      };

    case ADD_PERSON:
      return {
        ...state,
        lastAddedPerson: action.person
      };

    case UPDATE_PERSON:
      return {
        ...state,
        lastUpdatedPerson: action.person
      };

    case DELETE_PERSON:
      return {
        ...state,
        lastDeletedPerson: action.person
      };

    default:
      return state;
  }
}

export default people;
