import { client } from "../../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";
import { jwtDecode } from "jwt-decode";
import { buildMovimiento } from "./caja.helpers.js";

/**
 * Tipos de movimiento:
 *   - "ingreso"  → entrada de dinero (venta, pago de factura, otro ingreso)
 *   - "egreso"   → salida de dinero (gasto, devolucion, otro egreso)
 *
 * Origenes (origen):
 *   - "factura_venta"   → generado automaticamente al crear factura
 *   - "pago_factura"    → generado automaticamente al registrar pago de factura
 *   - "anulacion"       → generado automaticamente al anular factura
 *   - "manual"          → registrado manualmente por el usuario
 *
 * Metodos de pago (metodo_pago):
 *   - "efectivo", "tarjeta", "transferencia", "consignacion"
 */

// ─── CRUD ────────────────────────────────────────────────

export const getAll = async (empresaId) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "movimiento_caja" } },
            { term: { "empresa_id.keyword": empresaId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });
  const movimientos = result.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));
  return Promise.all(movimientos.map(buildMovimiento));
};

export const getById = (id) => {
  return getDocumentById(id);
};

export const pagination = async ({
  perPage = 10,
  page = 1,
  search = "",
  tipo = "",
  metodo_pago = "",
  fecha_desde = "",
  fecha_hasta = "",
  origen = "",
  empresa_id = "",
}) => {
  const consulta = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [
            { term: { type: "movimiento_caja" } },
            ...(empresa_id ? [{ term: { "empresa_id.keyword": empresa_id } }] : []),
          ],
        },
      },
      sort: [{ fecha: { order: "desc" } }, { createdTime: { order: "desc" } }],
      aggs: {
        total_ingresos: {
          filter: { term: { tipo: "ingreso" } },
          aggs: { suma: { sum: { field: "monto" } } },
        },
        total_egresos: {
          filter: { term: { tipo: "egreso" } },
          aggs: { suma: { sum: { field: "monto" } } },
        },
      },
    },
  };

  if (search) {
    consulta.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["descripcion", "nota", "referencia"],
      },
    });
  }

  if (tipo) {
    consulta.body.query.bool.filter.push({ term: { tipo } });
  }

  if (metodo_pago) {
    consulta.body.query.bool.filter.push({
      term: { "metodo_pago.keyword": metodo_pago },
    });
  }

  if (origen) {
    consulta.body.query.bool.filter.push({
      term: { "origen.keyword": origen },
    });
  }

  if (fecha_desde || fecha_hasta) {
    const range = {};
    if (fecha_desde) range.gte = fecha_desde;
    if (fecha_hasta) range.lte = fecha_hasta;
    consulta.body.query.bool.filter.push({ range: { fecha: range } });
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
    resumen: {
      total_ingresos:
        searchResult.body.aggregations.total_ingresos.suma.value || 0,
      total_egresos:
        searchResult.body.aggregations.total_egresos.suma.value || 0,
    },
  };
};

// ─── Resumen por dia ─────────────────────────────────────

export const getResumenDia = async (fecha, empresaId) => {
  if (!fecha) throw new Error("Falta fecha");

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type": "movimiento_caja" } },
            { term: { fecha } },
            ...(empresaId ? [{ term: { "empresa_id.keyword": empresaId } }] : []),
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
      aggs: {
        por_tipo: {
          terms: { field: "tipo.keyword" },
          aggs: { total: { sum: { field: "monto" } } },
        },
        por_metodo: {
          terms: { field: "metodo_pago.keyword" },
          aggs: {
            total: { sum: { field: "monto" } },
            por_tipo: {
              terms: { field: "tipo.keyword" },
              aggs: { total: { sum: { field: "monto" } } },
            },
          },
        },
      },
    },
  });

  const movimientos = await Promise.all(
    result.body.hits.hits.map(async (c) => {
      const mov = { ...c._source, _id: c._id };
      if (mov.user_create_id) {
        const user = await getDocumentById(mov.user_create_id);
        mov.user_create = { name: user?.name ?? null };
      }
      return mov;
    }),
  );

  const aggs = result.body.aggregations;
  const porTipo = {};
  aggs.por_tipo.buckets.forEach((b) => {
    porTipo[b.key] = b.total.value;
  });

  const porMetodo = {};
  aggs.por_metodo.buckets.forEach((b) => {
    porMetodo[b.key] = {
      total: b.total.value,
      ingresos: 0,
      egresos: 0,
    };
    b.por_tipo.buckets.forEach((t) => {
      if (t.key === "ingreso") porMetodo[b.key].ingresos = t.total.value;
      if (t.key === "egreso") porMetodo[b.key].egresos = t.total.value;
    });
  });

  return {
    fecha,
    movimientos,
    resumen: {
      total_ingresos: porTipo.ingreso || 0,
      total_egresos: porTipo.egreso || 0,
      balance: (porTipo.ingreso || 0) - (porTipo.egreso || 0),
      por_metodo: porMetodo,
    },
  };
};

// ─── Resumen por rango de fechas ─────────────────────────

export const getResumenRango = async (fecha_desde, fecha_hasta, empresaId) => {
  if (!fecha_desde || !fecha_hasta) throw new Error("Faltan fechas");

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { type: "movimiento_caja" } },
            ...(empresaId ? [{ term: { "empresa_id.keyword": empresaId } }] : []),
          ],
          filter: [{ range: { fecha: { gte: fecha_desde, lte: fecha_hasta } } }],
        },
      },
      sort: [{ fecha: { order: "desc" } }, { createdTime: { order: "desc" } }],
      aggs: {
        por_tipo: {
          terms: { field: "tipo.keyword" },
          aggs: { total: { sum: { field: "monto" } } },
        },
        por_metodo: {
          terms: { field: "metodo_pago.keyword" },
          aggs: {
            total: { sum: { field: "monto" } },
            por_tipo: {
              terms: { field: "tipo.keyword" },
              aggs: { total: { sum: { field: "monto" } } },
            },
          },
        },
        por_dia: {
          terms: { field: "fecha.keyword", size: 100, order: { _key: "desc" } },
          aggs: {
            por_tipo: {
              terms: { field: "tipo.keyword" },
              aggs: { total: { sum: { field: "monto" } } },
            },
          },
        },
      },
    },
  });

  const movimientos = await Promise.all(
    result.body.hits.hits.map(async (c) => {
      const mov = { ...c._source, _id: c._id };
      if (mov.user_create_id) {
        const user = await getDocumentById(mov.user_create_id);
        mov.user_create = { name: user?.name ?? null };
      }
      return mov;
    }),
  );

  const aggs = result.body.aggregations;
  const porTipo = {};
  aggs.por_tipo.buckets.forEach((b) => {
    porTipo[b.key] = b.total.value;
  });

  const porMetodo = {};
  aggs.por_metodo.buckets.forEach((b) => {
    porMetodo[b.key] = {
      total: b.total.value,
      ingresos: 0,
      egresos: 0,
    };
    b.por_tipo.buckets.forEach((t) => {
      if (t.key === "ingreso") porMetodo[b.key].ingresos = t.total.value;
      if (t.key === "egreso") porMetodo[b.key].egresos = t.total.value;
    });
  });

  const porDia = aggs.por_dia.buckets.map((b) => {
    const dia = { fecha: b.key, ingresos: 0, egresos: 0 };
    b.por_tipo.buckets.forEach((t) => {
      if (t.key === "ingreso") dia.ingresos = t.total.value;
      if (t.key === "egreso") dia.egresos = t.total.value;
    });
    dia.balance = dia.ingresos - dia.egresos;
    return dia;
  });

  return {
    fecha_desde,
    fecha_hasta,
    movimientos,
    resumen: {
      total_ingresos: porTipo.ingreso || 0,
      total_egresos: porTipo.egreso || 0,
      balance: (porTipo.ingreso || 0) - (porTipo.egreso || 0),
      por_metodo: porMetodo,
      por_dia: porDia,
    },
  };
};

// ─── Crear movimiento manual ─────────────────────────────

export const create = async (data, token) => {
  const decoded = jwtDecode(token);
  data.user_create_id = decoded?._id;

  if (!data.fecha) {
    data.fecha = new Date().toISOString().split("T")[0];
  }
  if (!data.hora) {
    data.hora = new Date().toLocaleTimeString("es-CO", { hour12: false });
  }

  data.origen = "manual";

  const response = await crearElasticByType(data, "movimiento_caja");
  return { message: "Movimiento registrado", movimiento: response.body };
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Movimiento actualizado" };
  }
};

// ─── Anular movimiento ───────────────────────────────────

export const anular = async (id) => {
  const r = await updateElasticByType(id, { estado: "anulado" });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Movimiento anulado" };
  }
};

// ─── Integracion con facturas ────────────────────────────

export const registrarMovimientoFactura = async (factura, token) => {
  const decoded = jwtDecode(token);

  const movimiento = {
    tipo: "ingreso",
    monto: factura.total_monto,
    metodo_pago: factura.metodo_pago || "efectivo",
    descripcion: `Venta - Factura #${factura.numero_factura}`,
    nota: factura.nota || "",
    fecha: factura.dia_venta || new Date().toISOString().split("T")[0],
    hora: new Date().toLocaleTimeString("es-CO", { hour12: false }),
    origen: "factura_venta",
    referencia_id: factura._id,
    referencia: `Factura #${factura.numero_factura}`,
    estado: "activo",
    empresa_id: factura.empresa_id,
    user_create_id: decoded?._id,
  };

  await crearElasticByType(movimiento, "movimiento_caja");
};

export const registrarMovimientoPago = async (pago, facturaId, token) => {
  const decoded = jwtDecode(token);
  const factura = await getDocumentById(facturaId);

  const movimiento = {
    tipo: "ingreso",
    monto: pago.monto,
    metodo_pago: pago.metodo_pago || "efectivo",
    descripcion: `Pago recibido - Factura #${factura?.numero_factura || ""}`,
    nota: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toLocaleTimeString("es-CO", { hour12: false }),
    origen: "pago_factura",
    referencia_id: facturaId,
    referencia: `Factura #${factura?.numero_factura || ""}`,
    estado: "activo",
    empresa_id: pago.empresa_id || factura?.empresa_id,
    user_create_id: decoded?._id,
  };

  await crearElasticByType(movimiento, "movimiento_caja");
};

export const registrarMovimientoAnulacion = async (facturaId, token) => {
  const decoded = jwtDecode(token);
  const factura = await getDocumentById(facturaId);

  const movimiento = {
    tipo: "egreso",
    monto: factura?.total_monto || 0,
    metodo_pago: factura?.metodo_pago || "efectivo",
    descripcion: `Anulacion - Factura #${factura?.numero_factura || ""}`,
    nota: "Movimiento generado por anulacion de factura",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toLocaleTimeString("es-CO", { hour12: false }),
    origen: "anulacion",
    referencia_id: facturaId,
    referencia: `Factura #${factura?.numero_factura || ""}`,
    estado: "activo",
    empresa_id: factura?.empresa_id,
    user_create_id: decoded?._id,
  };

  await crearElasticByType(movimiento, "movimiento_caja");
};
