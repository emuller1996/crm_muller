import { client } from "../../db.js";
import {
  crearElasticByType,
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
            { term: { "type.keyword": "rol" } },
            ...(empresaId ? [{ term: { "empresa_id.keyword": empresaId } }] : []),
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });
  return result.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));
};

export const create = async (data) => {
  const response = await crearElasticByType(data, "rol");
  return response;
};

export const update = async (data, id) => {
  return await updateElasticByType(id, data);
};
