import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Dictionary } from '../i18n-config';

interface DictionaryState {
  dict: Dictionary | null;
}

const initialState: DictionaryState = {
  dict: null,
};

const dictionarySlice = createSlice({
  name: 'dictionary',
  initialState,
  reducers: {
    setDictionary: (state, action: PayloadAction<Dictionary>) => {
      state.dict = action.payload;
    },
  },
});

export const { setDictionary } = dictionarySlice.actions;
export default dictionarySlice.reducer;
