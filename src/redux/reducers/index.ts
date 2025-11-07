import {combineReducers} from 'redux';
import userReducer from './userReducer';

import {USER_LOG_OUT} from '../actions/types';
import globalReducer from './globalReducer';
import homeReducer from './homeReducer';

// Combine all reducers.
const appReducer = combineReducers({
  /* your app’s top-level reducers */
  user: userReducer,
  global: globalReducer,
  home: homeReducer,
});

// Redux: Root Reducer
const rootReducer = (state:any, action:any) => {
  // when a logout action is dispatched it will reset redux state
  // if (action.type === USER_LOG_OUT) {
  //   state = undefined;
  // }

  return appReducer(state, action);
};

export default rootReducer;
