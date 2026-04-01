import axios from 'axios';

export const getAllUsuariosService = (token) => {
  return axios.get('/admin/usuarios', { headers: { 'access-token': token } });
};

export const getUsuarioByIdService = (token, id) => {
  return axios.get(`/admin/usuarios/${id}`, { headers: { 'access-token': token } });
};

export const createUsuarioService = (token, data) => {
  return axios.post('/admin/usuarios', data, { headers: { 'access-token': token } });
};

export const updateUsuarioService = (token, id, data) => {
  return axios.put(`/admin/usuarios/${id}`, data, { headers: { 'access-token': token } });
};

export const changePasswordUsuarioService = (token, id, password) => {
  return axios.patch(`/admin/usuarios/${id}/password`, { password }, { headers: { 'access-token': token } });
};

export const disableUsuarioService = (token, id) => {
  return axios.patch(`/admin/usuarios/${id}/disable`, {}, { headers: { 'access-token': token } });
};

export const enableUsuarioService = (token, id) => {
  return axios.patch(`/admin/usuarios/${id}/enable`, {}, { headers: { 'access-token': token } });
};
