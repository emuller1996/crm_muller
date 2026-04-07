import {
  buscarElasticByTypeAndBusiness,
  crearElasticByType,
  updateElasticByType,
} from "../../utils/index.js";

export const getAll = async (empresa_id) => {
  let data = await buscarElasticByTypeAndBusiness("categoria",empresa_id);
  return data;
};

export const create = async (data) => {
  const response = await crearElasticByType(data, "categoria");
  return response;
};

export const update = async (data, id) => {
  return await updateElasticByType(id, data);
};
