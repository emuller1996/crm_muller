/* eslint-disable prettier/prettier */

import axios from "axios";

export const postCreateEventoService = (data) => {
  return axios.post("/eventos", data);
};


export const getAllEventoService = (data) => {
  return axios.get("/eventos", data);
};

export const getAllEventoByIdService = (id) => {
  return axios.get(`/eventos/${id}`);
};

export const getAlFuncionesByEventoIdService = (id) => {
  return axios.get(`/eventos/${id}/funciones`);
};

export const postFuncionesByEventoIdService = (id, data) => {
  return axios.post(`/eventos/${id}/funcion`, data);
};




