import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RatingState {
  ratings: any[];
}

const initialState: RatingState = {
  ratings: [],
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    addRating: (state, action: PayloadAction<any>) => {
      state.ratings.push(action.payload);
    },
  },
});

export const { addRating } = ratingSlice.actions;

export default ratingSlice.reducer;
