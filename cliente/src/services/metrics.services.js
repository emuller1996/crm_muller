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
