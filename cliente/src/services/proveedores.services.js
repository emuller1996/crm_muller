/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateProveedorService = (token, data) => {
  return axios.post('/proveedores', data, { headers: { 'access-token': token } })
}

export const getAllProveedoresService = (token, signal) => {
  return axios.get('/proveedores', { headers: { 'access-token': token }, signal: signal })
}

export const getProveedorByIdService = (token, id) => {
  return axios.get(`/proveedores/${id}`, { headers: { 'access-token': token } })
}

export const putUpdateProveedorService = (token, id, data) => {
  return axios.put(`/proveedores/${id}`, data, { headers: { 'access-token': token } })
}

export const getProveedoresSearchPaginationServices = async (token, ...params) => {
  const searchs = new URLSearchParams()

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchs.append(key, value)
    }
  })

  return await axios.get(`/proveedores/pagination/?${searchs.toString()}`, {
    headers: {
      'access-token': `${token}`,
    },
  })
}
