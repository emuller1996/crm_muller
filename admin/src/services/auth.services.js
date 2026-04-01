import axios from 'axios';

export const loginService = (data) => {
  return axios.post('/admin/auth/login', data);
};

export const validateTokenService = (token) => {
  return axios.get('/admin/auth/validate', { headers: { 'access-token': token } });
};
