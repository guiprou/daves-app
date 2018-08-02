
export const LOG_IN = 'LOG_IN';

import { setNotification } from './notification.js';

export const login = (name, password) => (dispatch, getState) => {
  const state = getState();
    Parse.User.logIn(name, password, {
        success: function(user) {
            // Do stuff after successful login, like a redirect.
            console.log('User logged in successful with username: ' + user.get("username") + ' and email: ' + user.get("email"));
            dispatch({
              type: LOG_IN,
              user: {
                name: user.get('username'),
                id: user.id,
                acl: user.get("ACL")
              }
            });
        },
        error: function(user, error) {
          var level = 'error';
          var message = error.message;
          // me.dispatchEvent(new CustomEvent('notify', {detail: {level: level, message: message}}));
          dispatch(setNotification(level, message));
          console.log('The login failed with error: ' + error.code + ' ' + error.message);
        }
    });
}
