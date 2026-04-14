import { client } from "../../db.js";
import { INDEX_ES_MAIN_LOGS } from "../../config.js";

export const pagination = async ({
  perPage = 20,
  page = 1,
  search = "",
  modulo = "",
  accion = "",
  success = "",
  fecha_desde = "",
  fecha_hasta = "",
  empresa_id = "",
}) => {
  const consulta = {
    index: INDEX_ES_MAIN_LOGS,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [
            { term: { "type.keyword": "audit_log" } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  };

  if (empresa_id) {
    consulta.body.query.bool.filter.push({
      term: { "empresa_id.keyword": empresa_id },
    });
  }
  if (modulo) {
    consulta.body.query.bool.filter.push({
      term: { "modulo.keyword": modulo },
    });
  }
  if (accion) {
    consulta.body.query.bool.filter.push({
      term: { "accion.keyword": accion },
    });
  }
  if (success !== "") {
    consulta.body.query.bool.filter.push({
      term: { success: success === "true" },
    });
  }
  if (fecha_desde || fecha_hasta) {
    const range = {};
    if (fecha_desde) range.gte = new Date(fecha_desde).getTime();
    if (fecha_hasta) range.lte = new Date(fecha_hasta + "T23:59:59").getTime();
    consulta.body.query.bool.filter.push({
      range: { createdTime: range },
    });
  }
  if (search) {
    consulta.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["descripcion", "user_name", "url", "response_message"],
      },
    });
  }

  const searchResult = await client.search(consulta);

  const data = searchResult.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));

  return {
    data,
    total: searchResult.body.hits.total.value,
    total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
  };
};

export const getById = async (id) => {
  const result = await client.get({
    index: INDEX_ES_MAIN_LOGS,
    id,
  });
  return { ...result.body._source, _id: result.body._id };
};

export const getStats = async (empresa_id) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const filter = [
    { term: { "type.keyword": "audit_log" } },
  ];
  if (empresa_id) {
    filter.push({ term: { "empresa_id.keyword": empresa_id } });
  }

  const result = await client.search({
    index: INDEX_ES_MAIN_LOGS,
    size: 0,
    body: {
      query: { bool: { filter } },
      aggs: {
        hoy: {
          filter: { range: { createdTime: { gte: hoy.getTime() } } },
        },
        por_modulo: {
          terms: { field: "modulo.keyword", size: 20 },
        },
        por_accion: {
          terms: { field: "accion.keyword", size: 10 },
        },
        errores: {
          filter: { term: { success: false } },
        },
      },
    },
  });

  return {
    total: result.body.hits.total.value,
    hoy: result.body.aggregations.hoy.doc_count,
    errores: result.body.aggregations.errores.doc_count,
    por_modulo: result.body.aggregations.por_modulo.buckets.map((b) => ({
      modulo: b.key,
      count: b.doc_count,
    })),
    por_accion: result.body.aggregations.por_accion.buckets.map((b) => ({
      accion: b.key,
      count: b.doc_count,
    })),
  };
};
