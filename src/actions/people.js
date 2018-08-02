export const GET_PEOPLE = 'GET_PEOPLE';
export const ADD_PERSON = 'ADD_PERSON';
export const UPDATE_PERSON = 'UPDATE_PERSON';
export const DELETE_PERSON = 'DELETE_PERSON';

import { setNotification } from './notification.js';
import { deletePersonTasks } from './tasks.js';

const Person = Parse.Object.extend("Person");

export const getPeople = () => (dispatch, getState) => {
  const state = getState();
  var people_array = [];

  var query = new Parse.Query(Person);
  query.ascending('name');
  query.find({
    success: function (people) {
      if (people) {
        people.forEach(function (person) {
          people_array.push({
            id: person.id,
            name: person.get("name"),
            title: person.get("title")
          });
        });

        dispatch({
          type: GET_PEOPLE,
          people: people_array
        });

      } else {
        var level = 'error';
        var message = 'Could not find people.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
      }
    },
    error: function (error) {
      var level = 'error';
      var message = 'Could not get people: ' + error.code + " " + error.message;
      // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      dispatch(setNotification(level, message));
      console.log(message);
    }
  });
};

export const addPerson = (name, title) => (dispatch, getState) => {
  const state = getState();

  var newPerson = new Person();

  if (name.length > 0 && title.length > 0) {
    newPerson.set("name", name);
    newPerson.set("title", title);

    newPerson.save(null, {
      success: function (object) {

        var person = {
          id: object.id,
          name: object.get("name"),
          title: object.get("title"),
        };

        var level = 'success';
        var message = person.name.toUpperCase() + ' created successfully.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        dispatch({
          type: ADD_PERSON,
          person: person
        });

        dispatch(getPeople());
      },
      error: function (response, error) {
        var level = 'error';
        var message = 'Could not create Person with name ' + name.toUpperCase() + ': ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
      }
    });
  } else {
    var level = 'warning';
    var message = 'Please, make sure Name and Title inputs are not empty.';
    // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
    console.log(message);
    dispatch(setNotification(level, message));

  }
}

export const updatePerson = (id, name, title) => (dispatch, getState) => {
  const state = getState();

  if (name != '' && title != '') {
    var query = new Parse.Query(Person);
    query.equalTo("objectId", id);
    query.first({
      success: function(object) {
        object.set('name', name);
        object.set('title', title);
        object.save();

        var person = {
          id: id,
          name: object.get("name"),
          title: object.get("title"),
        };

        var level = 'success';
        var message = person.name.toUpperCase() + ' updated successfully.';
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        // me._closeEditDialog();
        // me.refresh();
        dispatch({
          type: UPDATE_PERSON,
          person: person
        });

        dispatch(getPeople());
      },

      error: function(error) {
        var level = 'error';
          var message = 'Could not update person with name ' + name.toUpperCase() + ': ' + error.code + " " + error.message;
          // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
          dispatch(setNotification(level, message));
          console.log(message);
        }
      });
    } else {
      var level = 'warning';
      var message = 'Please, make sure Name and Title inputs are not empty.';
      // this.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
      dispatch(setNotification(level, message));
      console.log(message);
    }
  }


  export const deletePerson = (id) => (dispatch, getState) => {
    const state = getState();

    var query = new Parse.Query(Person);
    query.equalTo("objectId", id);
    query.first({
      success: function (object) {
        if (object) {
          object.destroy({
            success: function(response) {

              var person = {
                id: id,
                name: response.get("name"),
                title: response.get("title"),
              };

              var level = 'success';
              var message = person.name.toUpperCase() + ' deleted successfully.';
              // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
              dispatch(setNotification(level, message));

              dispatch({
                type: DELETE_PERSON,
                person: person
              });

              dispatch(deletePersonTasks(id));
              dispatch(getPeople());
            },
            error: function(response, error) {
              var level = 'error';
              var message = 'Could not delete person with name ' + person.name.toUpperCase() + ': ' + error.code + " " + error.message;
              // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
              dispatch(setNotification(level, message));
              console.log(message);
            }
          });
        } else {
          var level = 'error';
          var message = 'Could not find person to delete.';
          // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
          dispatch(setNotification(level, message));
          console.log(message);
          return null;
        }
      },
      error: function (error) {
        var level = 'error';
        var message = 'Could not find person to delete: ' + error.code + " " + error.message;
        // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
        dispatch(setNotification(level, message));
        console.log(message);
        return null;
      }
    });
  }
