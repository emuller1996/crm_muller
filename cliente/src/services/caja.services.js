/* eslint-disable prettier/prettier */
import axios from 'axios'

export const getAllCajaService = (token, signal) => {
  return axios.get('/caja', { headers: { 'access-token': token }, signal })
}

export const getCajaByIdService = (token, id) => {
  return axios.get(`/caja/${id}`, { headers: { 'access-token': token } })
}

export const getCajaResumenDiaService = (token, fecha) => {
  return axios.get(`/caja/resumen/${fecha}`, { headers: { 'access-token': token } })
}

export const getCajaPaginationService = async (token, ...params) => {
  const searchs = new URLSearchParams()

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchs.append(key, value)
    }
  })

  return await axios.get(`/caja/pagination/?${searchs.toString()}`, {
    headers: { 'access-token': `${token}` },
  })
}

export const getCajaResumenRangoService = (token, fecha_desde, fecha_hasta) => {
  return axios.get(`/caja/resumen-rango?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`, {
    headers: { 'access-token': token },
  })
}

export const postCreateMovimientoService = (token, data) => {
  return axios.post('/caja', data, { headers: { 'access-token': token } })
}

export const putUpdateMovimientoService = (token, id, data) => {
  return axios.put(`/caja/${id}`, data, { headers: { 'access-token': token } })
}

export const patchAnularMovimientoService = (token, id) => {
  return axios.patch(`/caja/${id}/anular`, {}, { headers: { 'access-token': token } })
}
