/* eslint-disable prettier/prettier */
import axios from 'axios'

export const getAllActividadesService = (token, signal) =>
  axios.get('/actividades', { headers: { 'access-token': token }, signal })

export const getActividadByIdService = (token, id) =>
  axios.get(`/actividades/${id}`, { headers: { 'access-token': token } })

export const postCreateActividadService = (token, data) =>
  axios.post('/actividades', data, { headers: { 'access-token': token } })

export const putUpdateActividadService = (token, id, data) =>
  axios.put(`/actividades/${id}`, data, { headers: { 'access-token': token } })

export const deleteActividadService = (token, id) =>
  axios.delete(`/actividades/${id}`, { headers: { 'access-token': token } })
