/* eslint-disable prettier/prettier */

import axios from 'axios'

export const postCreateUsuariosService = (token, data) => {
  return axios.post('/usuarios', data, { headers: { 'access-token': token } })
}

export const getAllUsuariosService = (token, signal) => {
  return axios.get('/usuarios', { headers: { 'access-token': token }, signal })
}

export const patchUpdateUsuariosService = (token, data,id) => {
  return axios.patch(`/usuarios/${id}`, data, { headers: { 'access-token': token } })
}

export const patchChangePasswordUsuariosService = (token, data,id) => {
  return axios.patch(`/usuarios/${id}/change_password`, data, { headers: { 'access-token': token } })
}

export const postCreateRoleService = (token, data) => {
  return axios.post('/roles', data, { headers: { 'access-token': token } })
}

export const getAllRoleService = (token, signal) => {
  return axios.get('/roles', { headers: { 'access-token': token }, signal })
}

export const putChangeRoleService = (token, data,id) => {
  return axios.put(`/roles/${id}`, data, { headers: { 'access-token': token } })
}