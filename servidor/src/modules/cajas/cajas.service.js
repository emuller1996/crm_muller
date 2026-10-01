import { client } from "../../db.js";
import {
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

const TYPE = "caja_config";

const parseUsuarios = (usuarios) => {
  try {
    const ids = JSON.parse(usuarios ?? "[]");
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
};

const getUsuariosDetalle = async (usuarios) => {
  const ids = parseUsuarios(usuarios);
  const detalle = await Promise.all(
    ids.map(async (id) => {
      try {
        const user = await getDocumentById(id);
        return { _id: id, name: user?.name ?? null };
      } catch {
        return { _id: id, name: null };
      }
    }),
  );
  return detalle;
};

export const getAll = async (empresaId) => {
  const searchResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": TYPE } },
            { term: { "empresa_id.keyword": empresaId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });
  return searchResult.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));
};

export const pagination = async ({ perPage = 10, page = 1, search = "", estado = "", empresa_id }) => {
  const consulta = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [
            { term: { "type.keyword": TYPE } },
            { term: { "empresa_id.keyword": empresa_id } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  };

  if (search) {
    consulta.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["nombre", "nota"],
      },
    });
  }

  if (estado) {
    consulta.body.query.bool.filter.push({ term: { "estado.keyword": estado } });
  }

  const searchResult = await client.search(consulta);

  const data = await Promise.all(
    searchResult.body.hits.hits.map(async (c) => {
      if (c._source.user_create_id) {
        try {
          const user = await getDocumentById(c._source.user_create_id);
          c._source.user_create = { name: user?.name ?? null };
        } catch {
          c._source.user_create = { name: null };
        }
      }
      c._source.usuarios_detalle = await getUsuariosDetalle(c._source.usuarios);
      return { ...c._source, _id: c._id };
    }),
  );

  return {
    data,
    total: searchResult.body.hits.total.value,
    total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
  };
};

export const getById = (id) => {
  return getDocumentById(id);
};

export const create = async (data) => {
  const response = await crearElasticByType(data, TYPE);
  return response.body;
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }
};
