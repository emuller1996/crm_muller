/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreatePedidosService = (token,data) => {
  return axios.post('/pedidos', data, { headers: { 'access-token': token }})
}

export const getAllPedidosService = (token,signal) => {
  return axios.get('/pedidos', { signal: signal ,headers: { 'access-token': token }})
}


export const putUpdatePedidosService = (token,id, data) => {
  return axios.put(`/pedidos/${id}`, data,{ headers: { 'access-token': token }})
}
