import { setNotification } from './notification';

export const LOG_IN = 'LOG_IN';

export const login = (name, password) => async (dispatch) => {
  try {
    const user = await Parse.User.logIn(name, password);
    dispatch({
      type: LOG_IN,
      user: {
        name: user.get('username'),
        id: user.id,
        acl: user.get('ACL'),
      },
    });
  } catch (error) {
    const level = 'error';
    const message = `The login failed with error: ${error.code} ${error.message}`;
    dispatch(setNotification(level, message));
    console.log(message);
  }
};
