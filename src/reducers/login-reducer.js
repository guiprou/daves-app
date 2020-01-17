import { LOG_IN } from '../actions/login';

const login = (state = { user: {} }, action) => {
  switch (action.type) {
    case LOG_IN:
      return {
        ...state,
        user: action.user,
      };

    default:
      return state;
  }
};

export default login;
