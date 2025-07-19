import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import App from './App'
//import store from './store'

import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'
import es from 'javascript-time-ago/locale/es'
import { store } from './redux/store'

TimeAgo.addDefaultLocale(es)
TimeAgo.addLocale(es)

const theme = createTheme({
  typography: {
    fontFamily: [
      '"Sofia Sans"',
      'Roboto', // opcional: fallback a Roboto (la fuente por defecto de MUI)
      'Arial',
      'sans-serif',
    ].join(','),
    // También puedes configurar variantes específicas
    h1: {
      fontFamily: '"Otra Fuente", sans-serif',
    },
  },
})

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
)
