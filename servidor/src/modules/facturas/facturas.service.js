import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";

import { client } from "../../db.js";
import { INDEX_ES_MAIN } from "../../config.js";
import { jwtDecode } from "jwt-decode";

import {
  buildFactura,
  buildPagoFactura,
} from "./facturas.helpers.js";

export const getAll = async () => {
  let data = await buscarElasticByType("factura");

  return Promise.all(data.map(buildFactura));
};

export const getById = async (id) => {
  return await getDocumentById(id);
};

export const getPerDay = async (date) => {
  if (!date) throw new Error("Falta fecha");

  const result = await client.search({
    index: INDEX_ES_MAIN,
    body: {
      query: {
        bool: {
          must: [
            { match: { "type.keyword": "factura" } },
            { match: { dia_venta: new Date(date) } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });

  let invoices = result.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));

  return Promise.all(invoices.map(buildFactura));
};

export const create = async (data, token) => {
  if (!data.status) data.status = "Pendiente";

  const decoded = jwtDecode(token);
  data.user_create_id = decoded?._id;

  const response = await crearElasticByType(data, "factura");

  if (data.cotizacion_id) {
    await updateElasticByType(data.cotizacion_id, {
      factura_id: response.body._id,
    });
  }

  return {
    message: "Factura creada",
    factura: response.body,
  };
};

export const update = async (id, body) => {
  const r = await updateElasticByType(id, body);

  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Factura actualizada" };
  }
};

export const createPago = async (facturaId, data, token) => {
  const decoded = jwtDecode(token);

  data.factura_id = facturaId;
  data.user_create_id = decoded?._id;

  await crearElasticByType(data, "pago_factura");

  return { message: "Pago creado correctamente" };
};

export const getPagos = async (facturaId) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "pago_factura" } },
            { term: { "factura_id.keyword": facturaId } },
          ],
        },
      },
      aggs: {
        suma_pagos: {
          sum: { field: "monto" },
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });

  let pagos = result.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));

  pagos = await Promise.all(pagos.map(buildPagoFactura));

  return {
    pagos,
    suma: result.body.aggregations.suma_pagos,
  };
};