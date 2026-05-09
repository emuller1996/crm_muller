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
import {
  registrarMovimientoFactura,
  registrarMovimientoPago,
  registrarMovimientoAnulacion,
} from "../caja/caja.service.js";
import {
  registrarSalidaPorFacturaVenta,
  reversarSalidaPorAnulacion,
} from "../inventario/inventario.service.js";

export const getAll = async (empresaId) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "factura" } },
            { term: { "empresa_id.keyword": empresaId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });
  let data = result.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));
  return Promise.all(data.map(buildFactura));
};

export const getById = async (id) => {
  return await getDocumentById(id);
};

export const pagination = async ({
  perPage = 10,
  page = 1,
  search = "",
  status = "",
  metodo_pago = "",
  client_id = "",
  fecha_desde = "",
  fecha_hasta = "",
  empresa_id = "",
}) => {
  const consulta = {
    index: INDEX_ES_MAIN,
    size: Number(perPage),
    from: (Number(page) - 1) * Number(perPage),
    body: {
      query: {
        bool: {
          must: [],
          filter: [
            { term: { "type.keyword": "factura" } },
            ...(empresa_id ? [{ term: { "empresa_id.keyword": empresa_id } }] : []),
          ],
        },
      },
      sort: [{ dia_venta: { order: "desc" } }, { createdTime: { order: "desc" } }],
    },
  };

  if (status) {
    consulta.body.query.bool.filter.push({ term: { "status.keyword": status } });
  }
  if (metodo_pago) {
    consulta.body.query.bool.filter.push({ term: { "metodo_pago.keyword": metodo_pago } });
  }
  if (client_id) {
    consulta.body.query.bool.filter.push({ term: { "client_id.keyword": client_id } });
  }
  if (fecha_desde || fecha_hasta) {
    const range = {};
    if (fecha_desde) range.gte = fecha_desde;
    if (fecha_hasta) range.lte = fecha_hasta;
    consulta.body.query.bool.filter.push({ range: { dia_venta: range } });
  }
  if (search) {
    consulta.body.query.bool.must.push({
      query_string: { query: `*${search}*`, fields: ["nota", "numero_factura"] },
    });
  }

  const searchResult = await client.search(consulta);
  const data = searchResult.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));

  return {
    data: await Promise.all(data.map(buildFactura)),
    total: searchResult.body.hits.total.value,
    total_pages: Math.ceil(searchResult.body.hits.total.value / Number(perPage)),
  };
};

export const getPerDay = async (date, empresaId) => {
  if (!date) throw new Error("Falta fecha");

  const result = await client.search({
    index: INDEX_ES_MAIN,
    body: {
      query: {
        bool: {
          must: [
            { match: { "type.keyword": "factura" } },
            { match: { dia_venta: new Date(date) } },
            { term: { "empresa_id.keyword": empresaId } },
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

  const { body: countResult } = await client.count({
    index: INDEX_ES_MAIN,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "factura" } },
            { term: { "empresa_id.keyword": data.empresa_id } },
          ],
        },
      },
    },
  });
  data.numero_factura = countResult.count + 1;

  const response = await crearElasticByType(data, "factura");

  if (data.cotizacion_id) {
    await updateElasticByType(data.cotizacion_id, {
      factura_id: response.body._id,
    });
  }

  // Registrar movimiento de caja si la factura es Pagada
  try {
    if (data.status === "Pagada") {
      await registrarMovimientoFactura(
        { ...data, _id: response.body._id },
        token,
      );
    }
  } catch (err) {
    console.log("Error al registrar movimiento de caja:", err.message);
  }

  // Registrar salida de inventario por los productos vendidos
  try {
    await registrarSalidaPorFacturaVenta(
      { ...data, _id: response.body._id },
      token,
    );
  } catch (err) {
    console.log("Error al registrar salida de inventario:", err.message);
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

  // Registrar movimiento de caja por pago
  try {
    await registrarMovimientoPago(data, facturaId, token);
  } catch (err) {
    console.log("Error al registrar movimiento de caja por pago:", err.message);
  }

  return { message: "Pago creado correctamente" };
};

export const anularFactura = async (id, token) => {
  const r = await updateElasticByType(id, { status: "Anulada" });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });

    // Registrar movimiento de egreso por anulacion
    try {
      if (token) {
        await registrarMovimientoAnulacion(id, token);
      }
    } catch (err) {
      console.log("Error al registrar movimiento de anulacion:", err.message);
    }

    // Reversar salida de inventario
    try {
      if (token) {
        await reversarSalidaPorAnulacion(id, token);
      }
    } catch (err) {
      console.log("Error al reversar inventario por anulacion:", err.message);
    }

    return { message: "Factura anulada" };
  }
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