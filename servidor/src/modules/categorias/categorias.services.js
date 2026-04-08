import {
  buscarElasticByTypeAndBusiness,
  crearElasticByType,
  getElasticByIdAndBusiness,
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


export const getById = async (id, empresa_id) => {
  try {
    const data = await getElasticByIdAndBusiness(id, "categoria", empresa_id);
    return data;
  } catch (error) {
    throw new Error(`Error al obtener categoría: ${error.message}`);
  }
};