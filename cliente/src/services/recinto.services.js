/* eslint-disable prettier/prettier */

import axios from "axios";

export const postCreateClienteService = (data) => {
  return axios.post("/clientes", data);
};


export const getAllRecintosService = (data) => {
  return axios.get("/recinto", data);
};

export const getAllEsquemasByRecintosService = (idRecinto) => {
  return axios.get(`/recinto/${idRecinto}/esquemas`);
};


