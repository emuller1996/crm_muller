/* eslint-disable prettier/prettier */
import axios from 'axios'

export const postCreateProductoService = (data, token) => {
  return axios.post('/productos', data, { headers: { 'access-token': token } })
}

export const getAllProductoService = (token, signal) => {
  return axios.get('/productos', { headers: { 'access-token': token }, signal: signal })
}

export const putUpdateProductoService = (id, data) => {
  return axios.put(`/productos/${id}`, data)
}

export const postCreateProductoImageService = (data, product_id) => {
  return axios.post(`/productos/${product_id}/images`, data)
}

export const postCreateStockProductoService = (data, product_id, token) => {
  return axios.post(`/productos/${product_id}/stock`, data, { headers: { 'access-token': token } })
}

export const postCreateConsultaProductoService = (data, product_id, token) => {
  return axios.post(`/productos/${product_id}/consultas`, data, { headers: { 'Authorization': token } })
}

export const putUpdateStockProductoService = (data, product_id, token) => {
  return axios.put(`/productos/stock/${product_id}/`, data, { headers: { 'access-token': token } })
}

export const postValidateStockProductoService = (data, product_id, token) => {
  return axios.post(`/productos/stock/${product_id}/validate/`, data, { headers: { 'access-token': token } })
}

export const getAllProductoImageService = (product_id, signal) => {
  return axios.get(`/productos/${product_id}/images`, { signal: signal })
}

export const getAllProductoStockService = (product_id, signal) => {
  return axios.get(`/productos/${product_id}/stock`, { signal: signal })
}

export const getAllProductoLogsStockService = (product_id, signal) => {
  return axios.get(`/productos/${product_id}/stock/logs`, { signal: signal })
}

export const getAllProductoConsultaService = (product_id, signal) => {
  return axios.get(`/productos/${product_id}/consultas`, { signal: signal })
}

export const getAllProductoByIdService = (id) => {
  return axios.get(`/productos/${id}`)
}

export const postImportProductoService = (data, token) => {
  return axios.post(`/productos/import-excel/`, data, {
    headers: { 'access-token': token, 'Content-Type': 'multipart/form-data' },
  })
}


export const getProductoSearchPaginationServices = async (token, ...params) => {
  const searchs = new URLSearchParams();

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchs.append(key, value);
    }
  });

  return await axios.get(`/productos/pagination/?${searchs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getProductoSearchPublishedServices = async (token, ...params) => {
  const searchs = new URLSearchParams();

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchs.append(key, value);
    }
  });

  return await axios.get(`/productos/published/?${searchs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
