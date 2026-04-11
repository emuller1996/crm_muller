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
