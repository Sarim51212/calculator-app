import { createSlice } from '@reduxjs/toolkit';

const historySlice = createSlice({
  name: 'history',
  initialState: { entries: [] },
  reducers: {
    addEntry: (state, action) => {
      state.entries.push(action.payload);
    },
    clearHistory: (state) => {
      state.entries = [];
    },
    removeEntry: (state, action) => {
      state.entries = state.entries.filter((_, i) => i !== action.payload);
    },
    setHistory: (state, action) => {
      state.entries = action.payload;
    },
  },
});

const { addEntry, clearHistory, removeEntry, setHistory } = historySlice.actions;

export { addEntry, clearHistory, removeEntry, setHistory };
export default historySlice.reducer;