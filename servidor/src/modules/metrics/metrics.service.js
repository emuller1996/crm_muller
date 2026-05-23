import { client } from "../../db.js";
import { INDEX_ES_MAIN } from "../../config.js";

/**
 * Helpers de fechas
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
};

/**
 * Filtro base por empresa y tipo
 */
const baseFilter = (type, empresaId) => [
  { term: { "type.keyword": type } },
  { term: { "empresa_id.keyword": empresaId } },
];

/**
 * KPIs generales - totales clave del negocio
 */
export const getKPIs = async (empresaId) => {
  const hoy = startOfDay(new Date());
  const finHoy = endOfDay(new Date());
  const hace30 = daysAgo(30);

  // Ventas de hoy (facturas no anuladas)
  const ventasHoyResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: baseFilter("factura", empresaId),
          must_not: [{ term: { "status.keyword": "Anulada" } }],
          filter: [
            { range: { createdTime: { gte: hoy.getTime(), lte: finHoy.getTime() } } },
          ],
        },
      },
      aggs: {
        total: { sum: { field: "total_monto" } },
        count: { value_count: { field: "numero_factura" } },
      },
    },
  });

  // Ventas del mes (ultimos 30 dias)
  const ventasMesResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: baseFilter("factura", empresaId),
          must_not: [{ term: { "status.keyword": "Anulada" } }],
          filter: [
            { range: { createdTime: { gte: hace30.getTime() } } },
          ],
        },
      },
      aggs: {
        total: { sum: { field: "total_monto" } },
        count: { value_count: { field: "numero_factura" } },
      },
    },
  });

  // Facturas pendientes (por cobrar)
  const pendientesResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            ...baseFilter("factura", empresaId),
            { term: { "status.keyword": "Pendiente" } },
          ],
        },
      },
      aggs: {
        total: { sum: { field: "total_monto" } },
        count: { value_count: { field: "numero_factura" } },
      },
    },
  });

  // Totales generales
  const [productosCount, clientesCount, proveedoresCount] = await Promise.all([
    client.count({
      index: INDEX_ES_MAIN,
      body: { query: { bool: { must: baseFilter("producto", empresaId) } } },
    }),
    client.count({
      index: INDEX_ES_MAIN,
      body: { query: { bool: { must: baseFilter("cliente", empresaId) } } },
    }),
    client.count({
      index: INDEX_ES_MAIN,
      body: { query: { bool: { must: baseFilter("proveedor", empresaId) } } },
    }),
  ]);

  return {
    ventas_hoy: {
      total: ventasHoyResult.body.aggregations.total.value || 0,
      count: ventasHoyResult.body.aggregations.count.value || 0,
    },
    ventas_mes: {
      total: ventasMesResult.body.aggregations.total.value || 0,
      count: ventasMesResult.body.aggregations.count.value || 0,
    },
    pendientes: {
      total: pendientesResult.body.aggregations.total.value || 0,
      count: pendientesResult.body.aggregations.count.value || 0,
    },
    totales: {
      productos: productosCount.body.count,
      clientes: clientesCount.body.count,
      proveedores: proveedoresCount.body.count,
    },
  };
};

/**
 * Ventas agrupadas por dia (ultimos N dias).
 * Hace la agrupacion en JS porque createdTime esta mapeado como long en ES
 * y date_histogram no aplica formato consistente.
 */
export const getVentasPorDia = async (empresaId, dias = 7) => {
  const desde = daysAgo(dias - 1);

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: baseFilter("factura", empresaId),
          must_not: [{ term: { "status.keyword": "Anulada" } }],
          filter: [{ range: { createdTime: { gte: desde.getTime() } } }],
        },
      },
      _source: ["createdTime", "total_monto"],
    },
  });

  // Inicializar todos los dias en 0 para tener el grafico completo
  const mapa = {};
  for (let i = 0; i < dias; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (dias - 1 - i));
    const key = d.toISOString().split("T")[0];
    mapa[key] = { fecha: key, timestamp: d.getTime(), total: 0, count: 0 };
  }

  // Sumar cada factura a su dia correspondiente
  for (const hit of result.body.hits.hits) {
    const ts = hit._source.createdTime;
    if (!ts) continue;
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    if (mapa[key]) {
      mapa[key].total += Number(hit._source.total_monto) || 0;
      mapa[key].count += 1;
    }
  }

  return Object.values(mapa).sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Top productos mas vendidos (por cantidad)
 */
export const getTopProductos = async (empresaId, limite = 5) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 500,
    body: {
      query: {
        bool: {
          must: baseFilter("factura", empresaId),
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      _source: ["productos", "total_monto"],
    },
  });

  // Agregar manualmente porque productos es un array anidado
  const productoMap = {};
  for (const hit of result.body.hits.hits) {
    const productos = hit._source.productos || [];
    for (const p of productos) {
      const key = p.product_id || p.product_name;
      if (!key) continue;
      if (!productoMap[key]) {
        productoMap[key] = {
          product_id: p.product_id,
          name: p.product_name,
          cantidad: 0,
          total: 0,
        };
      }
      productoMap[key].cantidad += Number(p.cantidad) || 0;
      productoMap[key].total += (Number(p.price) || 0) * (Number(p.cantidad) || 0);
    }
  }

  return Object.values(productoMap)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);
};

/**
 * Ventas por metodo de pago (del mes)
 */
export const getVentasPorMetodoPago = async (empresaId) => {
  const hace30 = daysAgo(30);

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: baseFilter("factura", empresaId),
          must_not: [{ term: { "status.keyword": "Anulada" } }],
          filter: [{ range: { createdTime: { gte: hace30.getTime() } } }],
        },
      },
      aggs: {
        por_metodo: {
          terms: { field: "metodo_pago.keyword", size: 10 },
          aggs: {
            total: { sum: { field: "total_monto" } },
          },
        },
      },
    },
  });

  return result.body.aggregations.por_metodo.buckets.map((b) => ({
    metodo: b.key,
    total: b.total.value || 0,
    count: b.doc_count,
  }));
};

/**
 * Top clientes por monto comprado (del mes)
 */
export const getTopClientes = async (empresaId, limite = 5) => {
  const hace30 = daysAgo(30);

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: baseFilter("factura", empresaId),
          must_not: [{ term: { "status.keyword": "Anulada" } }],
          filter: [{ range: { createdTime: { gte: hace30.getTime() } } }],
        },
      },
      aggs: {
        por_cliente: {
          terms: {
            field: "client_id.keyword",
            size: limite,
            order: { total: "desc" },
          },
          aggs: {
            total: { sum: { field: "total_monto" } },
          },
        },
      },
    },
  });

  const buckets = result.body.aggregations.por_cliente.buckets;

  // Enriquecer con nombres de cliente
  const clientes = await Promise.all(
    buckets.map(async (b) => {
      try {
        const clienteDoc = await client.get({
          index: INDEX_ES_MAIN,
          id: b.key,
        });
        return {
          client_id: b.key,
          nombre: clienteDoc.body._source.name || "Sin nombre",
          total: b.total.value || 0,
          count: b.doc_count,
        };
      } catch {
        return {
          client_id: b.key,
          nombre: "Cliente no encontrado",
          total: b.total.value || 0,
          count: b.doc_count,
        };
      }
    })
  );

  return clientes;
};

/**
 * Productos con stock bajo (stock_actual <= 5)
 */
export const getStockBajo = async (empresaId, limite = 10) => {
  // Primero obtenemos los productos de la empresa
  const productosResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: { bool: { must: baseFilter("producto", empresaId) } },
      _source: ["name"],
    },
  });

  if (productosResult.body.hits.hits.length === 0) return [];

  const prodIds = productosResult.body.hits.hits.map((p) => p._id);

  // Agregacion de movimientos por producto
  const aggsResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "movimiento_inventario" } },
            { term: { "empresa_id.keyword": empresaId } },
            { terms: { "producto_id.keyword": prodIds } },
            { term: { "estado.keyword": "activo" } },
          ],
        },
      },
      aggs: {
        por_producto: {
          terms: { field: "producto_id.keyword", size: prodIds.length },
          aggs: {
            entradas: {
              filter: { term: { "tipo.keyword": "entrada" } },
              aggs: { suma: { sum: { field: "cantidad" } } },
            },
            salidas: {
              filter: { term: { "tipo.keyword": "salida" } },
              aggs: { suma: { sum: { field: "cantidad" } } },
            },
          },
        },
      },
    },
  });

  const stockMap = {};
  for (const bucket of aggsResult.body.aggregations.por_producto.buckets) {
    stockMap[bucket.key] = (bucket.entradas.suma.value || 0) - (bucket.salidas.suma.value || 0);
  }

  const productos = productosResult.body.hits.hits.map((p) => ({
    _id: p._id,
    nombre: p._source.name,
    stock: stockMap[p._id] || 0,
  }));

  return productos
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limite);
};

/**
 * Caja del dia - ingresos vs egresos
 */
export const getCajaHoy = async (empresaId) => {
  const hoy = new Date().toISOString().split("T")[0];

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            ...baseFilter("movimiento_caja", empresaId),
            { term: { fecha: hoy } },
          ],
          must_not: [{ term: { "estado.keyword": "anulado" } }],
        },
      },
      aggs: {
        ingresos: {
          filter: { term: { "tipo.keyword": "ingreso" } },
          aggs: { total: { sum: { field: "monto" } } },
        },
        egresos: {
          filter: { term: { "tipo.keyword": "egreso" } },
          aggs: { total: { sum: { field: "monto" } } },
        },
      },
    },
  });

  const ingresos = result.body.aggregations.ingresos.total.value || 0;
  const egresos = result.body.aggregations.egresos.total.value || 0;

  return {
    ingresos,
    egresos,
    balance: ingresos - egresos,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// METRICAS DETALLADAS POR TAB
// ─────────────────────────────────────────────────────────────────────────────

const buildDateRangeFilter = (field, fecha_desde, fecha_hasta) => {
  if (!fecha_desde && !fecha_hasta) return null;
  const range = {};
  if (fecha_desde) range.gte = fecha_desde;
  if (fecha_hasta) range.lte = fecha_hasta;
  return { range: { [field]: range } };
};

/**
 * Resolver IDs a documentos (clientes, proveedores, productos) en lote
 */
const enrichByIds = async (ids, fieldName) => {
  const map = {};
  for (const id of ids) {
    if (!id) continue;
    try {
      const result = await client.get({ index: INDEX_ES_MAIN, id });
      map[id] = result.body._source[fieldName] || "";
    } catch {
      map[id] = "";
    }
  }
  return map;
};

// ─── TAB VENTAS ─────────────────────────────────────────────────────────────

export const getMetricasVentas = async ({
  empresa_id,
  fecha_desde = "",
  fecha_hasta = "",
  metodo_pago = "",
}) => {
  const filterBase = [
    { term: { "type.keyword": "factura" } },
    { term: { "empresa_id.keyword": empresa_id } },
  ];

  const filterActivas = [...filterBase];
  const filterTodas = [...filterBase];

  const dateFilter = buildDateRangeFilter("dia_venta", fecha_desde, fecha_hasta);
  if (dateFilter) {
    filterActivas.push(dateFilter);
    filterTodas.push(dateFilter);
  }
  if (metodo_pago) {
    filterActivas.push({ term: { "metodo_pago.keyword": metodo_pago } });
    filterTodas.push({ term: { "metodo_pago.keyword": metodo_pago } });
  }

  // KPIs - facturas no anuladas
  const kpisResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: filterActivas,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      aggs: {
        total: { sum: { field: "total_monto" } },
        count: { value_count: { field: "numero_factura" } },
        ticket_promedio: { avg: { field: "total_monto" } },
      },
    },
  });

  // KPI - anuladas
  const anuladasResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [...filterTodas, { term: { "status.keyword": "Anulada" } }],
        },
      },
      aggs: { count: { value_count: { field: "numero_factura" } } },
    },
  });

  // Por dia (en JS porque createdTime/dia_venta puede no ser tipo date)
  const ventasResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: filterActivas,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      _source: ["dia_venta", "total_monto", "metodo_pago", "client_id", "productos"],
    },
  });

  const porDiaMap = {};
  const porMetodoMap = {};
  const porClienteMap = {};
  const productoMap = {};

  for (const hit of ventasResult.body.hits.hits) {
    const f = hit._source;
    const dia = f.dia_venta || "sin-fecha";
    if (!porDiaMap[dia]) porDiaMap[dia] = { fecha: dia, total: 0, count: 0 };
    porDiaMap[dia].total += Number(f.total_monto) || 0;
    porDiaMap[dia].count += 1;

    const m = f.metodo_pago || "sin-metodo";
    if (!porMetodoMap[m]) porMetodoMap[m] = { metodo: m, total: 0, count: 0 };
    porMetodoMap[m].total += Number(f.total_monto) || 0;
    porMetodoMap[m].count += 1;

    const c = f.client_id || "cliente_mostrador";
    if (!porClienteMap[c]) porClienteMap[c] = { client_id: c, total: 0, count: 0 };
    porClienteMap[c].total += Number(f.total_monto) || 0;
    porClienteMap[c].count += 1;

    for (const p of f.productos || []) {
      const key = p.product_id || p.product_name;
      if (!key) continue;
      if (!productoMap[key]) {
        productoMap[key] = {
          product_id: p.product_id,
          name: p.product_name,
          cantidad: 0,
          total: 0,
        };
      }
      productoMap[key].cantidad += Number(p.cantidad) || 0;
      productoMap[key].total += (Number(p.price) || 0) * (Number(p.cantidad) || 0);
    }
  }

  const por_dia = Object.values(porDiaMap).sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );
  const por_metodo_pago = Object.values(porMetodoMap).sort(
    (a, b) => b.total - a.total,
  );

  // Top 10 clientes - enriquecer nombres
  const topClientes = Object.values(porClienteMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const clienteIds = topClientes
    .map((c) => c.client_id)
    .filter((id) => id && id !== "cliente_mostrador");
  const nombresClientes = await enrichByIds(clienteIds, "name");
  const top_clientes = topClientes.map((c) => ({
    ...c,
    nombre:
      c.client_id === "cliente_mostrador"
        ? "CLIENTE DE MOSTRADOR"
        : nombresClientes[c.client_id] || "Sin nombre",
  }));

  const top_productos = Object.values(productoMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    kpis: {
      total_ventas: kpisResult.body.aggregations.total.value || 0,
      total_facturas: kpisResult.body.aggregations.count.value || 0,
      ticket_promedio: kpisResult.body.aggregations.ticket_promedio.value || 0,
      anuladas: anuladasResult.body.aggregations.count.value || 0,
    },
    por_dia,
    por_metodo_pago,
    top_productos,
    top_clientes,
  };
};

// ─── TAB COMPRAS ────────────────────────────────────────────────────────────

export const getMetricasCompras = async ({
  empresa_id,
  fecha_desde = "",
  fecha_hasta = "",
  metodo_pago = "",
}) => {
  const filterBase = [
    { term: { "type.keyword": "factura_compra" } },
    { term: { "empresa_id.keyword": empresa_id } },
  ];

  const filter = [...filterBase];
  const dateFilter = buildDateRangeFilter("dia_compra", fecha_desde, fecha_hasta);
  if (dateFilter) filter.push(dateFilter);
  if (metodo_pago) filter.push({ term: { "metodo_pago.keyword": metodo_pago } });

  // KPIs
  const kpisResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: filter,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      aggs: {
        total: { sum: { field: "total_monto" } },
        count: { value_count: { field: "numero_factura" } },
        ticket_promedio: { avg: { field: "total_monto" } },
        recibidas: {
          filter: { term: { "estado_remision.keyword": "Recibida" } },
        },
        pendientes_remision: {
          filter: {
            bool: {
              should: [
                { term: { "estado_remision.keyword": "Pendiente" } },
                { bool: { must_not: [{ exists: { field: "estado_remision" } }] } },
              ],
            },
          },
        },
      },
    },
  });

  // Compras detalladas
  const comprasResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: filter,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      _source: ["dia_compra", "total_monto", "metodo_pago", "proveedor_id", "productos"],
    },
  });

  const porDiaMap = {};
  const porMetodoMap = {};
  const porProveedorMap = {};
  const productoMap = {};

  for (const hit of comprasResult.body.hits.hits) {
    const f = hit._source;
    const dia = f.dia_compra || "sin-fecha";
    if (!porDiaMap[dia]) porDiaMap[dia] = { fecha: dia, total: 0, count: 0 };
    porDiaMap[dia].total += Number(f.total_monto) || 0;
    porDiaMap[dia].count += 1;

    const m = f.metodo_pago || "sin-metodo";
    if (!porMetodoMap[m]) porMetodoMap[m] = { metodo: m, total: 0, count: 0 };
    porMetodoMap[m].total += Number(f.total_monto) || 0;
    porMetodoMap[m].count += 1;

    if (f.proveedor_id) {
      if (!porProveedorMap[f.proveedor_id]) {
        porProveedorMap[f.proveedor_id] = {
          proveedor_id: f.proveedor_id,
          total: 0,
          count: 0,
        };
      }
      porProveedorMap[f.proveedor_id].total += Number(f.total_monto) || 0;
      porProveedorMap[f.proveedor_id].count += 1;
    }

    for (const p of f.productos || []) {
      const key = p.product_id || p.product_name;
      if (!key) continue;
      if (!productoMap[key]) {
        productoMap[key] = {
          product_id: p.product_id,
          name: p.product_name,
          cantidad: 0,
          total: 0,
        };
      }
      productoMap[key].cantidad += Number(p.cantidad) || 0;
      productoMap[key].total += (Number(p.price) || 0) * (Number(p.cantidad) || 0);
    }
  }

  const por_dia = Object.values(porDiaMap).sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );
  const por_metodo_pago = Object.values(porMetodoMap).sort(
    (a, b) => b.total - a.total,
  );

  const topProveedores = Object.values(porProveedorMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const proveedorIds = topProveedores.map((p) => p.proveedor_id);
  const nombresProveedores = await enrichByIds(proveedorIds, "nombre");
  const por_proveedor = topProveedores.map((p) => ({
    ...p,
    nombre: nombresProveedores[p.proveedor_id] || "Sin nombre",
  }));

  const top_productos_comprados = Object.values(productoMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    kpis: {
      total_compras: kpisResult.body.aggregations.total.value || 0,
      total_facturas: kpisResult.body.aggregations.count.value || 0,
      ticket_promedio: kpisResult.body.aggregations.ticket_promedio.value || 0,
      recibidas: kpisResult.body.aggregations.recibidas.doc_count || 0,
      pendientes_remision:
        kpisResult.body.aggregations.pendientes_remision.doc_count || 0,
    },
    por_dia,
    por_metodo_pago,
    por_proveedor,
    top_productos_comprados,
  };
};

// ─── TAB PRODUCTOS ──────────────────────────────────────────────────────────

export const getMetricasProductos = async ({
  empresa_id,
  category_id = "",
  fecha_desde = "",
  fecha_hasta = "",
}) => {
  // 1. Catalogo: productos de la empresa (filtrados por categoria si aplica)
  const filterProductos = [
    { term: { "type.keyword": "producto" } },
    { term: { "empresa_id.keyword": empresa_id } },
  ];
  if (category_id) {
    filterProductos.push({ term: { "category_id.keyword": category_id } });
  }

  const productosResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: { bool: { must: filterProductos } },
      _source: ["name", "price", "costo", "category_id"],
    },
  });

  const productosCatalogo = productosResult.body.hits.hits.map((h) => ({
    _id: h._id,
    ...h._source,
  }));
  const idsCatalogo = new Set(productosCatalogo.map((p) => p._id));

  // 2. Facturas de venta no anuladas en el rango
  const filterFacturas = [
    { term: { "type.keyword": "factura" } },
    { term: { "empresa_id.keyword": empresa_id } },
  ];
  const dateFilter = buildDateRangeFilter("dia_venta", fecha_desde, fecha_hasta);
  if (dateFilter) filterFacturas.push(dateFilter);

  const facturasResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: filterFacturas,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      _source: ["productos"],
    },
  });

  // 3. Acumular ventas por producto
  const ventaPorProducto = {};
  for (const hit of facturasResult.body.hits.hits) {
    for (const p of hit._source.productos || []) {
      const key = p.product_id;
      if (!key) continue;
      // Si hay filtro de categoria, ignorar productos fuera del catalogo
      if (category_id && !idsCatalogo.has(key)) continue;
      if (!ventaPorProducto[key]) {
        ventaPorProducto[key] = {
          product_id: key,
          name: p.product_name,
          cantidad: 0,
          ingresos: 0,
        };
      }
      ventaPorProducto[key].cantidad += Number(p.cantidad) || 0;
      ventaPorProducto[key].ingresos +=
        (Number(p.price) || 0) * (Number(p.cantidad) || 0);
    }
  }

  // 4. Top por cantidad y por ingresos
  const todosLosVendidos = Object.values(ventaPorProducto);
  const top_por_cantidad = [...todosLosVendidos]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
  const top_por_ingresos = [...todosLosVendidos]
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 10);

  // 5. Margen - solo productos del catalogo
  const margenes = productosCatalogo
    .map((p) => {
      const price = Number(p.price) || 0;
      const costo = Number(p.costo) || 0;
      const margen = price - costo;
      const margen_pct = price > 0 ? (margen / price) * 100 : 0;
      return {
        _id: p._id,
        name: p.name,
        price,
        costo,
        margen,
        margen_pct,
      };
    })
    .filter((p) => p.price > 0 || p.costo > 0)
    .sort((a, b) => b.margen - a.margen)
    .slice(0, 20);

  // 6. Distribucion por categoria - mapa de category_id -> totales
  const productoCatById = {};
  for (const p of productosCatalogo) productoCatById[p._id] = p.category_id;
  const distMap = {};
  for (const [productId, datos] of Object.entries(ventaPorProducto)) {
    const cat = productoCatById[productId] || "sin-categoria";
    if (!distMap[cat]) {
      distMap[cat] = { category_id: cat, cantidad: 0, ingresos: 0 };
    }
    distMap[cat].cantidad += datos.cantidad;
    distMap[cat].ingresos += datos.ingresos;
  }
  const categoryIds = Object.keys(distMap).filter((id) => id !== "sin-categoria");
  const nombresCat = await enrichByIds(categoryIds, "name");
  const por_categoria = Object.values(distMap)
    .map((d) => ({
      ...d,
      nombre:
        d.category_id === "sin-categoria"
          ? "Sin categoria"
          : nombresCat[d.category_id] || "Sin nombre",
    }))
    .sort((a, b) => b.ingresos - a.ingresos);

  // 7. KPIs
  const productosVendidos = new Set(Object.keys(ventaPorProducto));
  const productos_sin_venta = productosCatalogo.filter(
    (p) => !productosVendidos.has(p._id),
  ).length;

  return {
    kpis: {
      total_productos_catalogo: productosCatalogo.length,
      productos_vendidos: productosVendidos.size,
      productos_sin_venta,
    },
    top_por_cantidad,
    top_por_ingresos,
    margen: margenes,
    por_categoria,
  };
};

// ─── TAB CLIENTES ───────────────────────────────────────────────────────────

export const getMetricasClientes = async ({
  empresa_id,
  client_id = "",
  fecha_desde = "",
  fecha_hasta = "",
}) => {
  const filterFacturas = [
    { term: { "type.keyword": "factura" } },
    { term: { "empresa_id.keyword": empresa_id } },
  ];
  const dateFilter = buildDateRangeFilter("dia_venta", fecha_desde, fecha_hasta);
  if (dateFilter) filterFacturas.push(dateFilter);
  if (client_id) filterFacturas.push({ term: { "client_id.keyword": client_id } });

  const facturasResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: filterFacturas,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      _source: ["client_id", "total_monto", "dia_venta"],
    },
  });

  // Map por cliente con totales
  const clienteMap = {};
  let totalGeneral = 0;
  let countGeneral = 0;
  for (const hit of facturasResult.body.hits.hits) {
    const f = hit._source;
    const cid = f.client_id || "cliente_mostrador";
    if (!clienteMap[cid]) {
      clienteMap[cid] = { client_id: cid, total: 0, count: 0 };
    }
    clienteMap[cid].total += Number(f.total_monto) || 0;
    clienteMap[cid].count += 1;
    totalGeneral += Number(f.total_monto) || 0;
    countGeneral += 1;
  }

  // Nuevos vs recurrentes: para cada cliente del rango, ver si tenia compras antes
  const clientesEnRango = Object.keys(clienteMap).filter(
    (id) => id !== "cliente_mostrador",
  );
  let nuevos = 0;
  let recurrentes = 0;
  if (fecha_desde && clientesEnRango.length > 0) {
    // Buscar facturas anteriores al rango por cada cliente
    const previousResult = await client.search({
      index: INDEX_ES_MAIN,
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              { term: { "type.keyword": "factura" } },
              { term: { "empresa_id.keyword": empresa_id } },
              { terms: { "client_id.keyword": clientesEnRango } },
              { range: { dia_venta: { lt: fecha_desde } } },
            ],
            must_not: [{ term: { "status.keyword": "Anulada" } }],
          },
        },
        aggs: {
          clientes_previos: {
            terms: { field: "client_id.keyword", size: clientesEnRango.length },
          },
        },
      },
    });
    const previos = new Set(
      previousResult.body.aggregations.clientes_previos.buckets.map((b) => b.key),
    );
    for (const cid of clientesEnRango) {
      if (previos.has(cid)) recurrentes++;
      else nuevos++;
    }
  } else {
    // Sin fecha_desde no podemos calcular - todos los clientes del rango se cuentan como "activos"
    recurrentes = clientesEnRango.length;
  }

  // Top clientes con nombres
  const topClientes = Object.values(clienteMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const idsParaEnriquecer = topClientes
    .map((c) => c.client_id)
    .filter((id) => id && id !== "cliente_mostrador");
  const nombresClientes = await enrichByIds(idsParaEnriquecer, "name");
  const top_clientes = topClientes.map((c) => ({
    ...c,
    nombre:
      c.client_id === "cliente_mostrador"
        ? "CLIENTE DE MOSTRADOR"
        : nombresClientes[c.client_id] || "Sin nombre",
    ticket_promedio: c.count > 0 ? c.total / c.count : 0,
  }));

  // Clientes sin actividad: clientes de la empresa que NO tienen ninguna factura en los ultimos 90 dias
  const hace90 = daysAgo(90);
  const recienteResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "factura" } },
            { term: { "empresa_id.keyword": empresa_id } },
            { range: { createdTime: { gte: hace90.getTime() } } },
          ],
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      aggs: {
        clientes_activos_90: {
          terms: { field: "client_id.keyword", size: 10000 },
        },
      },
    },
  });
  const activosRecientes = new Set(
    recienteResult.body.aggregations.clientes_activos_90.buckets.map((b) => b.key),
  );

  const todosClientesResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "cliente" } },
            { term: { "empresa_id.keyword": empresa_id } },
          ],
        },
      },
      _source: ["name", "telefono", "createdTime"],
    },
  });

  const sin_actividad = todosClientesResult.body.hits.hits
    .filter((h) => !activosRecientes.has(h._id))
    .map((h) => ({
      _id: h._id,
      nombre: h._source.name,
      telefono: h._source.telefono,
      desde: h._source.createdTime,
    }))
    .slice(0, 20);

  return {
    kpis: {
      total_clientes_activos: clientesEnRango.length,
      nuevos,
      recurrentes,
      ticket_promedio_general: countGeneral > 0 ? totalGeneral / countGeneral : 0,
    },
    top_clientes,
    sin_actividad,
  };
};

// ─── TAB PROVEEDORES ────────────────────────────────────────────────────────

export const getMetricasProveedores = async ({
  empresa_id,
  proveedor_id = "",
  fecha_desde = "",
  fecha_hasta = "",
}) => {
  const filter = [
    { term: { "type.keyword": "factura_compra" } },
    { term: { "empresa_id.keyword": empresa_id } },
  ];
  const dateFilter = buildDateRangeFilter("dia_compra", fecha_desde, fecha_hasta);
  if (dateFilter) filter.push(dateFilter);
  if (proveedor_id) {
    filter.push({ term: { "proveedor_id.keyword": proveedor_id } });
  }

  const comprasResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 10000,
    body: {
      query: {
        bool: {
          must: filter,
          must_not: [{ term: { "status.keyword": "Anulada" } }],
        },
      },
      _source: ["proveedor_id", "total_monto", "productos"],
    },
  });

  const proveedorMap = {};
  const productoMap = {};
  let totalGeneral = 0;
  let countGeneral = 0;

  for (const hit of comprasResult.body.hits.hits) {
    const f = hit._source;
    const pid = f.proveedor_id;
    totalGeneral += Number(f.total_monto) || 0;
    countGeneral += 1;
    if (pid) {
      if (!proveedorMap[pid]) {
        proveedorMap[pid] = { proveedor_id: pid, total: 0, count: 0 };
      }
      proveedorMap[pid].total += Number(f.total_monto) || 0;
      proveedorMap[pid].count += 1;
    }
    for (const p of f.productos || []) {
      const key = p.product_id || p.product_name;
      if (!key) continue;
      if (!productoMap[key]) {
        productoMap[key] = {
          product_id: p.product_id,
          name: p.product_name,
          cantidad: 0,
          total: 0,
        };
      }
      productoMap[key].cantidad += Number(p.cantidad) || 0;
      productoMap[key].total += (Number(p.price) || 0) * (Number(p.cantidad) || 0);
    }
  }

  const topProveedores = Object.values(proveedorMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const proveedorIds = topProveedores.map((p) => p.proveedor_id);
  const nombresProveedores = await enrichByIds(proveedorIds, "nombre");
  const top_proveedores = topProveedores.map((p) => ({
    ...p,
    nombre: nombresProveedores[p.proveedor_id] || "Sin nombre",
    ticket_promedio: p.count > 0 ? p.total / p.count : 0,
  }));

  const productos_por_proveedor = Object.values(productoMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    kpis: {
      total_compras: totalGeneral,
      proveedores_activos: Object.keys(proveedorMap).length,
      total_facturas: countGeneral,
      ticket_promedio: countGeneral > 0 ? totalGeneral / countGeneral : 0,
    },
    top_proveedores,
    productos_por_proveedor,
  };
};
