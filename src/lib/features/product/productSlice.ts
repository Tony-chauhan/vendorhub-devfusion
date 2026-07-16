import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { productDummyData } from '@/assets/assets';

export interface ProductBase {
  id: string;
  name: string;
  price: number;
  mrp: number;
  category: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: (string | any)[];
  rating?: { rating: number }[];
  [key: string]: unknown;
}

export interface ProductState {
  list: ProductBase[];
}

const initialState: ProductState = {
  list: productDummyData || [],
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<ProductBase[]>) => {
      state.list = action.payload;
    },
    clearProduct: (state) => {
      state.list = [];
    },
  },
});

export const { setProduct, clearProduct } = productSlice.actions;

export default productSlice.reducer;
