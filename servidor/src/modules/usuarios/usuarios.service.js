import md5 from "md5";
import { client } from "../../db.js";
import {
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

export const getAll = async (empresaId) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "usuario" } },
            ...(empresaId ? [{ term: { "empresa_id.keyword": empresaId } }] : []),
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });
  return result.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));
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
