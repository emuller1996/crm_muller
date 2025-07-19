/* eslint-disable prettier/prettier */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  unfoldable: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setState: (state, action) => {
      // Actualiza el estado con las propiedades del payload
      return { ...state, ...action.payload }
    },
  },
})

export const { setState } = appSlice.actions
export default appSlice.reducer
