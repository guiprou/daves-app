import { setNotification } from './notification';
import { deletePersonTasks } from './tasks';

export const GET_PEOPLE = 'GET_PEOPLE';
export const ADD_PERSON = 'ADD_PERSON';
export const UPDATE_PERSON = 'UPDATE_PERSON';
export const DELETE_PERSON = 'DELETE_PERSON';

const Person = Parse.Object.extend('Person');

export const getPeople = () => async (dispatch) => {
  const peopleArray = [];
  const query = new Parse.Query(Person);
  query.ascending('name');
  try {
    const people = await query.find();
    if (people) {
      people.forEach((person) => {
        peopleArray.push({
          id: person.id,
          name: person.get('name'),
          title: person.get('title'),
        });
      });
      dispatch({
        type: GET_PEOPLE,
        people: peopleArray,
      });
    } else {
      const level = 'error';
      const message = 'Could not find people.';
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } catch (error) {
    console.log(error)
    const level = 'error';
    const message = `Could not get people: ${error.code} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const addPerson = (name, title) => async (dispatch) => {
  const newPerson = new Person();
  if (name.length && title.length) {
    newPerson.set('name', name);
    newPerson.set('title', title);
    try {
      const object = await newPerson.save();
      const person = {
        id: object.id,
        name: object.get('name'),
        title: object.get('title'),
      };
      const level = 'success';
      const message = `${person.name.toUpperCase()} created successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: ADD_PERSON,
        person,
      });
      dispatch(getPeople());
    } catch (error) {
      const level = 'error';
      const message = `Could not create Person with name ${name.toUpperCase()}: ${error.code} ${error.message}`;
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } else {
    const level = 'warning';
    const message = 'Please, make sure Name and Title inputs are not empty.';
    console.log(message);
    dispatch(setNotification(level, message));
  }
};

export const updatePerson = (id, name, title) => async (dispatch) => {
  if (name && title) {
    const query = new Parse.Query(Person);
    query.equalTo('objectId', id);
    try {
      const object = await query.first();
      object.set('name', name);
      object.set('title', title);
      await object.save();
      const person = {
        id,
        name: object.get('name'),
        title: object.get('title'),
      };
      const level = 'success';
      const message = `${person.name.toUpperCase()} updated successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: UPDATE_PERSON,
        person,
      });
      dispatch(getPeople());
    } catch (error) {
      const level = 'error';
      const message = `Could not update person with name ${name.toUpperCase()}: ${error.code} ${error.message}`;
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } else {
    const level = 'warning';
    const message = 'Please, make sure Name and Title inputs are not empty.';
    dispatch(setNotification(level, message));
    console.log(message);
  }
};

export const deletePerson = (id) => async (dispatch) => {
  const query = new Parse.Query(Person);
  query.equalTo('objectId', id);
  try {
    const object = await query.first();
    if (object) {
      const response = await object.destroy();
      const person = {
        id,
        name: response.get('name'),
        title: response.get('title'),
      };
      const level = 'success';
      const message = `${person.name.toUpperCase()} deleted successfully.`;
      dispatch(setNotification(level, message));
      dispatch({
        type: DELETE_PERSON,
        person,
      });
      dispatch(deletePersonTasks(id));
      dispatch(getPeople());
    } else {
      const level = 'error';
      const message = 'Could not find person to delete.';
      dispatch(setNotification(level, message));
      console.log(message);
    }
  } catch (error) {
    const level = 'error';
    const message = `Could not delete person: ${error.code} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};
