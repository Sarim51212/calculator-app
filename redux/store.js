import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import historyReducer from './slices/historySlice';
import modeReducer from './slices/modeSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    history: historyReducer,
    mode: modeReducer,
  },
});

export default store;