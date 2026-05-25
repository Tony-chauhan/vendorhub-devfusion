import { addressDummyData } from '@/assets/assets';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AddressState {
  list: any[];
}

const initialState: AddressState = {
  list: [addressDummyData],
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<any>) => {
      state.list.push(action.payload);
    },
  },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
