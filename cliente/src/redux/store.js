/* eslint-disable prettier/prettier */

import { configureStore } from '@reduxjs/toolkit'
import ProductsSlice from './slices/ProductsSlice'
import appSlice from './slices/MenuSlice'

export const store = configureStore({
  reducer: {
    productosPublished: ProductsSlice,
    appSlice: appSlice,
  },
})
