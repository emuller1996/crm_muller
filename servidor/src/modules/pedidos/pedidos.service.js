import { client } from "../../db.js";
import {
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

const buildPedido = async (pedido) => {
  try {
    if (pedido.client_id) {
      const clientData = await getDocumentById(pedido.client_id);
      pedido.client = clientData ?? null;
    }
    if (pedido.user_create_id) {
      const user = await getDocumentById(pedido.user_create_id);
      pedido.user_create = { name: user?.name ?? null };
    }
    delete pedido.user_create_id;
  } catch (error) {
    console.log(error);
  }
  return pedido;
};

export const getAll = async (empresaId) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "pedido" } },
            { term: { "empresa_id.keyword": empresaId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });

  const data = result.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));

  return Promise.all(data.map(buildPedido));
};

export const getById = async (id) => {
  const pedido = await getDocumentById(id);
  return buildPedido(pedido);
};

export const create = async (data) => {
  data.status = data.status || "Pendiente";

  const { body: countResult } = await client.count({
    index: INDEX_ES_MAIN,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "pedido" } },
            { term: { "empresa_id.keyword": data.empresa_id } },
          ],
        },
      },
    },
  });
  data.numero_pedido = countResult.count + 1;

  const response = await crearElasticByType(data, "pedido");
  return { message: "Pedido creado", pedido: response.body };
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Pedido actualizado" };
  }
};
