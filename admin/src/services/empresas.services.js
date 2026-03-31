import axios from 'axios';

export const getAllEmpresasService = (token) => {
  return axios.get('/admin/empresas', { headers: { 'access-token': token } });
};

export const getEmpresaByIdService = (token, id) => {
  return axios.get(`/admin/empresas/${id}`, { headers: { 'access-token': token } });
};

export const createEmpresaService = (token, data) => {
  return axios.post('/admin/empresas', data, { headers: { 'access-token': token } });
};

export const updateEmpresaService = (token, id, data) => {
  return axios.put(`/admin/empresas/${id}`, data, { headers: { 'access-token': token } });
};

export const disableEmpresaService = (token, id) => {
  return axios.patch(`/admin/empresas/${id}/disable`, {}, { headers: { 'access-token': token } });
};

export const enableEmpresaService = (token, id) => {
  return axios.patch(`/admin/empresas/${id}/enable`, {}, { headers: { 'access-token': token } });
};

export const uploadLogoEmpresaService = (token, id, file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post(`/admin/empresas/${id}/logo`, formData, {
    headers: { 'access-token': token, 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteLogoEmpresaService = (token, id) => {
  return axios.delete(`/admin/empresas/${id}/logo`, { headers: { 'access-token': token } });
};
