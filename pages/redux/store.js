// 'store.js'
// Import the necessary modules from Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
// Import the reducer from your analysis slice
import analysisReducer from './slices/analysisSlice';

// Use Redux Toolkit's configureStore function to create the store
export default configureStore({
  reducer: {
    analysis: analysisReducer,  // Add the reducer here
  },
});
