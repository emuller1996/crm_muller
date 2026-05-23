/* eslint-disable prettier/prettier */
import axios from 'axios'

const headers = (token) => ({ headers: { 'access-token': token } })

export const getKPIsService = (token) => axios.get('/metrics/kpis', headers(token))

export const getVentasPorDiaService = (token, dias = 7) =>
  axios.get(`/metrics/ventas-por-dia?dias=${dias}`, headers(token))

export const getTopProductosService = (token, limite = 5) =>
  axios.get(`/metrics/top-productos?limite=${limite}`, headers(token))

export const getVentasPorMetodoPagoService = (token) =>
  axios.get('/metrics/ventas-por-metodo-pago', headers(token))

export const getTopClientesService = (token, limite = 5) =>
  axios.get(`/metrics/top-clientes?limite=${limite}`, headers(token))

export const getStockBajoService = (token, limite = 10) =>
  axios.get(`/metrics/stock-bajo?limite=${limite}`, headers(token))

export const getCajaHoyService = (token) => axios.get('/metrics/caja-hoy', headers(token))

// ─── Metricas detalladas por tab ───────────────────────────────────────────

const buildQuery = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value)
    }
  })
  return search.toString()
}

export const getMetricasVentasService = (token, params) =>
  axios.get(`/metrics/ventas?${buildQuery(params)}`, headers(token))

export const getMetricasComprasService = (token, params) =>
  axios.get(`/metrics/compras?${buildQuery(params)}`, headers(token))

export const getMetricasProductosService = (token, params) =>
  axios.get(`/metrics/productos?${buildQuery(params)}`, headers(token))

export const getMetricasClientesService = (token, params) =>
  axios.get(`/metrics/clientes?${buildQuery(params)}`, headers(token))

export const getMetricasProveedoresService = (token, params) =>
  axios.get(`/metrics/proveedores?${buildQuery(params)}`, headers(token))
