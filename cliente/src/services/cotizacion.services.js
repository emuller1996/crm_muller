/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateCotizacionService = (token,data) => {
  return axios.post('/cotizacion', data, { headers: { 'access-token': token }})
}

export const getAllCotizacionService = (token,signal) => {
  return axios.get('/cotizacion', { signal: signal ,headers: { 'access-token': token }})
}


export const putUpdateCotizacionService = (token,id, data) => {
  return axios.put(`/cotizacion/${id}`, data,{ headers: { 'access-token': token }})
}
