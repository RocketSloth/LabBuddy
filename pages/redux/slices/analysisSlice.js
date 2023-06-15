// 'analysisSlice.js'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const performAnalysis = createAsyncThunk('analysis/perform', async (question, thunkAPI) => {
  const response = await axios.post('/api/performAnalysis', { question });
  return response.data;
});

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: {
    analysis: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(performAnalysis.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(performAnalysis.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.analysis = action.payload;
      })
      .addCase(performAnalysis.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default analysisSlice.reducer;
