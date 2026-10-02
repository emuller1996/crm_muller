/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateCajaService = (token, data) => {
  return axios.post('/cajas', data, { headers: { 'access-token': token } })
}

export const getAllCajasService = (token, signal) => {
  return axios.get('/cajas', { headers: { 'access-token': token }, signal: signal })
}

export const getMisCajasService = (token) => {
  return axios.get('/cajas/mis-cajas', { headers: { 'access-token': token } })
}

export const getCajaByIdService =(token, id) => {
  return axios.get(`/cajas/${id}`, { headers: { 'access-token': token } })
}

export const putUpdateCajaService = (token, id, data) => {
  return axios.put(`/cajas/${id}`, data, { headers: { 'access-token': token } })
}

export const getCajasSearchPaginationServices = async (token, ...params) => {
  const searchs = new URLSearchParams()

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchs.append(key, value)
    }
  })

  return await axios.get(`/cajas/pagination/?${searchs.toString()}`, {
    headers: {
      'access-token': `${token}`,
    },
  })
}
