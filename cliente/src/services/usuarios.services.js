/* eslint-disable prettier/prettier */

import axios from 'axios'

export const postCreateUsuariosService = (token, data) => {
  return axios.post('/usuarios', data, { headers: { 'access-token': token } })
}

export const getAllUsuariosService = (token, signal) => {
  return axios.get('/usuarios', { headers: { 'access-token': token }, signal })
}
