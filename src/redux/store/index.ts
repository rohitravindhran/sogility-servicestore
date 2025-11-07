import AsyncStorage from '@react-native-async-storage/async-storage';
import {applyMiddleware, createStore} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import rootReducer from '../reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

// Redux Persist Config
const persistConfig = {
  // Root?
  key: 'servicestore',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // Whitelist (Save Specific Reducers)
  // whitelist: ['authReducer'],
  // Blacklist (Don't Save Specific Reducers)
  blacklist: [''],
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();

// Redux: Store
const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));

// Middleware: Redux Persist Persister
let persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

// Exports
export {store, persistor};
