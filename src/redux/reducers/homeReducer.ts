
import {

 SET_INITIAL_ROUTE, SET_OPENED_VIA_NOTIFICATION
} from '../actions/types';
const initialState = {

  initialRoute:'home',
  openedViaNotification:false,
};

const homeReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case SET_INITIAL_ROUTE:
      return {
        ...state,
        initialRoute: action.payload,
      };
      case SET_OPENED_VIA_NOTIFICATION:
        return {
          ...state,
          openedViaNotification: action.payload,
        };
    default:
      return state;
  }
};

export default homeReducer;
