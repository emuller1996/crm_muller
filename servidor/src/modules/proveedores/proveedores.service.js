import { client } from "../../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

export const getAll = async () => {
  const proveedores = await buscarElasticByType("proveedor");
  return Promise.all(proveedores);
};

export const pagination = async ({ perPage = 10, page = 1, search = "" }) => {
  const consulta = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [{ term: { type: "proveedor" } }],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  };

  if (search) {
    consulta.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["nombre", "numero_documento", "telefono", "nombre_contacto"],
      },
    });
  }

  const searchResult = await client.search(consulta);

  const data = await Promise.all(
    searchResult.body.hits.hits.map(async (c) => {
      if (c._source.user_create_id) {
        const user = await getDocumentById(c._source.user_create_id);
        c._source.user_create = { name: user?.name ?? null };
      }
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
  const response = await crearElasticByType(data, "proveedor");
  return response.body;
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }
};
