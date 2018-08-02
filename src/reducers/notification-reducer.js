import { SET_NOTIFICATION} from '../actions/notification.js';

const notification = (state = {notification: {}}, action) => {
  switch (action.type) {
    case SET_NOTIFICATION:
      return {
        ...state,
        notification: action.notification
      };

    default:
      return state;
  }
}

export default notification;
