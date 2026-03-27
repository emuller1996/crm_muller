/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateFacturaCompraService = (token, data) => {
  return axios.post('/factura-compra', data, { headers: { 'access-token': token } })
}

export const getAllFacturaCompraService = (token, signal) => {
  return axios.get('/factura-compra', { signal: signal, headers: { 'access-token': token } })
}

export const getAllFacturaCompraPerDayService = (token, signal, date) => {
  return axios.get(`/factura-compra/per_day/${date}`, { signal: signal, headers: { 'access-token': token } })
}

export const putUpdateFacturaCompraService = (token, id, data) => {
  return axios.put(`/factura-compra/${id}`, data, { headers: { 'access-token': token } })
}

export const postCreatePagoFacturaCompraService = (token, data, id) => {
  return axios.post(`/factura-compra/${id}/pagos`, data, { headers: { 'access-token': token } })
}

export const getAllPagosByFacturaCompraService = (token, signal, id) => {
  return axios.get(`/factura-compra/${id}/pagos`, { signal: signal, headers: { 'access-token': token } })
}

export const patchAnularFacturaCompraService = (token, id) => {
  return axios.patch(`/factura-compra/${id}/anular`, {}, { headers: { 'access-token': token } })
}
