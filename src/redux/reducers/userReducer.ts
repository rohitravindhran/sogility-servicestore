import {
  SAVE_USER,
  SAVE_TOKEN,
  USER_LOG_OUT,
  SET_BUSINESS_ID,
  SET_MULTILOCATIONS_DOMAIN
} from '../actions/types';

const initialState = {
  user: null,
  token: null,
  businessId: null,
  multiLocationDomains:[]
};

const userReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case SAVE_USER:
      return {
        ...state,
        user: action.payload,
      };
    case SAVE_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    case SET_BUSINESS_ID:
      return {
        ...state,
        businessId: action.payload,
      };
      case SET_MULTILOCATIONS_DOMAIN:
        return {
          ...state,
          multiLocationDomains: action.payload,
        };
    case USER_LOG_OUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default userReducer;
