import {
  buscarElasticByType,
  crearElasticByType,
  updateElasticByType,
} from "../../utils/index.js";

export const getAll = async () => {
  let data = await buscarElasticByType("categoria");
  return data;
};

export const create = async (data) => {
  const response = await crearElasticByType(data, "categoria");
  return response;
};

export const update = async (data, id) => {
  return await updateElasticByType(id, data);
};
