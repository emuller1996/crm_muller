import axios from 'axios'

export const postEstablecerEmpresaService = (token,data) => {
  return axios.post('/empresa', data, { headers: { 'access-token': token } })
}


export const getEmpresaService = (token) => {
  return axios.get('/empresa',  { headers: { 'access-token': token } })
}
