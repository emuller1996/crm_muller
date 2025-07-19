/* eslint-disable prettier/prettier */
// dataSlice.js
import { createSlice } from '@reduxjs/toolkit'

const ProductsSlice = createSlice({
  name: 'products',
  initialState: {
    products: null,
    total: null,
    filterData: {
      page: 1,
      perPage: 9,
      search: '',
      gender: null,
      category: null,
    },
  },
  reducers: {
    seFiltertData: (state, action) => {
      state.filterData = { ...state.filterData, ...action.payload }
    },
    setProductsP: (state, action) => {
      state.products = action.payload
    },
    setTotalProducts: (state, action) => {
      state.total = action.payload
    },
  },
})

export const { seFiltertData, setProductsP, setTotalProducts } = ProductsSlice.actions
export default ProductsSlice.reducer
