/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateFacturaService = (token, data) => {
  return axios.post('/factura', data, { headers: { 'access-token': token } })
}

export const getAllFacturaService = (token, signal) => {
  return axios.get('/factura', { signal: signal, headers: { 'access-token': token } })
}

export const putUpdateFacturaService = (token, id, data) => {
  return axios.put(`/factura/${id}`, data, { headers: { 'access-token': token } })
}

export const postCreatePagoFacturaService = (token, data, id) => {
  return axios.post(`/factura/${id}/pagos`, data, { headers: { 'access-token': token } })
}

export const getAllPagosByFacturaService = (token, signal,id) => {
  return axios.get(`/factura/${id}/pagos`, { signal: signal, headers: { 'access-token': token } })
}
