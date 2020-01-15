export const SET_NOTIFICATION = 'SET_NOTIFICATION';

export const setNotification = (level, message) => (dispatch) => {
  dispatch({
    type: SET_NOTIFICATION,
    notification: {
      level,
      message,
    },
  });
};
