import { client } from "../../db.js";
import {
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

const buildActividad = async (actividad) => {
  if (actividad.participantes && Array.isArray(actividad.participantes)) {
    actividad.participantes = await Promise.all(
      actividad.participantes.map(async (p) => {
        try {
          const doc = await getDocumentById(p.id);
          return { ...p, name: doc?.name ?? p.id };
        } catch {
          return p;
        }
      })
    );
  }
  return actividad;
};

export const getAll = async (empresaId) => {
  const now = new Date();
  const from = new Date(now);
  from.setMonth(from.getMonth() - 1);
  const to = new Date(now);
  to.setMonth(to.getMonth() + 3);

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 500,
    body: {
      query: {
        bool: {
          filter: [
            { term: { "type.keyword": "actividad" } },
            ...(empresaId ? [{ term: { "empresa_id.keyword": empresaId } }] : []),
            {
              range: {
                fecha_inicio: {
                  gte: from.toISOString(),
                  lte: to.toISOString(),
                },
              },
            },
          ],
        },
      },
      sort: [{ fecha_inicio: { order: "asc" } }],
    },
  });

  const data = result.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));

  return Promise.all(data.map(buildActividad));
};

export const getById = async (id) => {
  const actividad = await getDocumentById(id);
  return buildActividad(actividad);
};

export const create = async (data, userId) => {
  data.user_create_id = userId;
  if (!data.estado) data.estado = "Pendiente";
  await crearElasticByType(data, "actividad");
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Actividad actualizada" };
  }
  throw new Error("No se pudo actualizar");
};

export const remove = async (id) => {
  await client.delete({ index: INDEX_ES_MAIN, id });
  await client.indices.refresh({ index: INDEX_ES_MAIN });
};
