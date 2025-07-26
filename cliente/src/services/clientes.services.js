/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateClientesService = (token,data) => {
  return axios.post('/clientes', data,{ headers: { 'access-token': token } })
}

export const  postCreateComentarioClientesService = (token, id, data) => {
  return axios.post(`/clientes/${id}/comments`, data, { headers: { 'access-token': token } })
}

export const  getComentarioClientesService = (token, id) => {
  return axios.get(`/clientes/${id}/comments`,  { headers: { 'access-token': token } })
}


export const postLoginClientesService = (data) => {
  return axios.post('/clientes/login', data)
}

export const getAllClientesService = (token, signal) => {
  return axios.get('/clientes', { headers: { 'access-token': token }, signal: signal })
}

export const getAllClientesPaginationService = async (token, ...params) => {
  const searchs = new URLSearchParams();

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchs.append(key, value);
    }
  });

  return await axios.get(`/clientes/pagination/?${searchs.toString()}`, {
    headers: {
      'access-token':token,
    },
  });
};


export const putUpdateClientesService = (token, id, data) => {
  return axios.put(`/clientes/${id}`, data, { headers: { 'Authorization': token } })
}

export const postNewAddressClientesService = (token, data) => {
  return axios.post(`/clientes/new/address`, data, { headers: { 'Authorization': token } })
}

export const putNewAddressClientesService = (token, data,id) => {
  return axios.put(`/clientes/new/address/${id}/`, data, { headers: { 'Authorization': token } })
}


export const getGetAddressClientesService = (token) => {
  return axios.get(`/clientes/get/address`,{ headers: { 'Authorization': token } })
}


export const getGetShoppingClientesService = (token) => {
  return axios.get(`/clientes/get/shopping`,{ headers: { 'Authorization': token } })
}

export const getShopByIdService = (token, id) => {
  return axios.get(`/clientes/get/shopping/${id}`,{ headers: { 'Authorization': token } })
}

export const getClientesSearchPaginationServices = async (token, ...params) => {
  const searchs = new URLSearchParams();

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchs.append(key, value);
    }
  });

  return await axios.get(`/clientes/pagination/?${searchs.toString()}`, {
    headers: {
     'access-token': `${token}`,
    },
  });
};