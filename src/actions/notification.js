export const SET_NOTIFICATION = 'SET_NOTIFICATION';

export const setNotification = (level, message) => (dispatch, getState) => {
  const state = getState();
  dispatch({
    type: SET_NOTIFICATION,
    notification: {
      level: level,
      message: message
    }
  });
};
