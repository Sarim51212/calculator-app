import { createSlice } from '@reduxjs/toolkit';

const modeSlice = createSlice({
  name: 'mode',
  initialState: { current: 'standard' },
  reducers: {
    setMode: (state, action) => {
      state.current = action.payload;
    },
  },
});

export const { setMode } = modeSlice.actions;
export default modeSlice.reducer;