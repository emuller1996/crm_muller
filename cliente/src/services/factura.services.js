/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateFacturaService = (token,data) => {
  return axios.post('/factura', data, { headers: { 'access-token': token }})
}

export const getAllFacturaService = (token,signal) => {
  return axios.get('/factura', { signal: signal ,headers: { 'access-token': token }})
}


export const putUpdateFacturaService = (token,id, data) => {
  return axios.put(`/factura/${id}`, data,{ headers: { 'access-token': token }})
}
