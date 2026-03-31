import axios from 'axios';

export const loginService = (data) => {
  return axios.post('/auth/login', data);
};

export const validateTokenService = (token) => {
  return axios.get('/auth/validate', { headers: { 'access-token': token } });
};
