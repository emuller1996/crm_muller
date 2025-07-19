/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateClienteService = (data) => {
  return axios.post('/clientes', data)
}

