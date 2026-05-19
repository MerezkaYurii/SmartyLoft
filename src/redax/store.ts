import { configureStore } from '@reduxjs/toolkit';
import dictionaryReducer from './dictionarySlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      dictionary: dictionaryReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
