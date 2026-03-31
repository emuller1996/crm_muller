/* eslint-disable prettier/prettier */
import axios from 'axios'

export const getResumenInventarioService = async (token, ...params) => {
  const searchs = new URLSearchParams()

  if (params[0]) {
    Object.entries(params[0]).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchs.append(key, value)
      }
    })
  }

  return await axios.get(`/inventario/resumen?${searchs.toString()}`, {
    headers: { 'access-token': token },
  })
}

export const getMovimientosInventarioService = async (token, ...params) => {
  const searchs = new URLSearchParams()

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchs.append(key, value)
    }
  })

  return await axios.get(`/inventario/movimientos?${searchs.toString()}`, {
    headers: { 'access-token': token },
  })
}

export const getStockByProductoService = (token, id) => {
  return axios.get(`/inventario/producto/${id}/stock`, { headers: { 'access-token': token } })
}

export const getMovimientosByProductoService = (token, id) => {
  return axios.get(`/inventario/producto/${id}/movimientos`, { headers: { 'access-token': token } })
}

export const postRegistrarMovimientoService = (token, data) => {
  return axios.post('/inventario/movimiento', data, { headers: { 'access-token': token } })
}

export const patchAnularMovimientoService = (token, id) => {
  return axios.patch(`/inventario/movimiento/${id}/anular`, {}, { headers: { 'access-token': token } })
}
