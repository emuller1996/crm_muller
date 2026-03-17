import md5 from "md5";
import { client } from "../../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

export const getAll = async () => {
  return buscarElasticByType("usuario");
};

export const getById = async (id) => {
  return getDocumentById(id);
};

export const create = async (data, userId) => {
  data.user_create_id = userId;
  data.password = md5(data.password);
  await crearElasticByType(data, "usuario");
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }
};

export const changePassword = async (id, password) => {
  const r = await updateElasticByType(id, { password: md5(password) });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }
};
