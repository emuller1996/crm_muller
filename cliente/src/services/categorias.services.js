/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateCategoriaService = (token,data) => {
  return axios.post('/categoria', data, { headers: { 'access-token': token }})
}

export const getAllCategoriasService = (token,signal) => {
  return axios.get('/categoria', { signal: signal ,headers: { 'access-token': token }})
}


export const putUpdateCategoriaService = (token,id, data) => {
  return axios.put(`/categoria/${id}`, data,{ headers: { 'access-token': token }})
}
