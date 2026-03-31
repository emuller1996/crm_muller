import { client } from "../../db.js";
import {
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";
import { jwtDecode } from "jwt-decode";

/**
 * Obtener el stock actual de un producto.
 * Suma todos los movimientos de inventario activos del producto.
 */
export const getStockByProducto = async (productoId) => {
  const producto = await getDocumentById(productoId);

  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "movimiento_inventario" } },
            { term: { "producto_id.keyword": productoId } },
            { term: { "estado.keyword": "activo" } },
          ],
        },
      },
      aggs: {
        total_entradas: {
          filter: { term: { "tipo.keyword": "entrada" } },
          aggs: { suma: { sum: { field: "cantidad" } } },
        },
        total_salidas: {
          filter: { term: { "tipo.keyword": "salida" } },
          aggs: { suma: { sum: { field: "cantidad" } } },
        },
      },
    },
  });

  const entradas = result.body.aggregations.total_entradas.suma.value || 0;
  const salidas = result.body.aggregations.total_salidas.suma.value || 0;
  const stock_actual = entradas - salidas;

  return {
    producto_id: productoId,
    nombre_producto: producto?.name ?? "",
    stock_actual,
    total_entradas: entradas,
    total_salidas: salidas,
  };
};

/**
 * Obtener todos los movimientos de inventario paginados
 */
export const getMovimientos = async ({
  perPage = 20,
  page = 1,
  search = "",
  tipo = "",
  origen = "",
  producto_id = "",
}) => {
  const consulta = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [{ term: { "type.keyword": "movimiento_inventario" } }],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  };

  if (tipo) {
    consulta.body.query.bool.filter.push({ term: { "tipo.keyword": tipo } });
  }
  if (origen) {
    consulta.body.query.bool.filter.push({ term: { "origen.keyword": origen } });
  }
  if (producto_id) {
    consulta.body.query.bool.filter.push({
      term: { "producto_id.keyword": producto_id },
    });
  }
  if (search) {
    consulta.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["descripcion", "nombre_producto", "referencia"],
      },
    });
  }

  const searchResult = await client.search(consulta);

  const data = await Promise.all(
    searchResult.body.hits.hits.map(async (c) => {
      const mov = { ...c._source, _id: c._id };
      if (mov.user_create_id) {
        try {
          const user = await getDocumentById(mov.user_create_id);
          mov.user_create = { name: user?.name ?? null };
        } catch {
          mov.user_create = { name: null };
        }
      }
      return mov;
    }),
  );

  return {
    data,
    total: searchResult.body.hits.total.value,
    total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
  };
};

/**
 * Obtener historial de movimientos de un producto
 */
export const getMovimientosByProducto = async (productoId) => {
  const result = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "movimiento_inventario" } },
            { term: { "producto_id.keyword": productoId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });

  return result.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));
};

/**
 * Registrar movimiento manual de inventario (entrada o salida)
 */
export const registrarMovimientoManual = async (data, token) => {
  const decoded = jwtDecode(token);

  const producto = await getDocumentById(data.producto_id);

  const movimiento = {
    producto_id: data.producto_id,
    nombre_producto: producto?.name ?? "",
    tipo: data.tipo, // "entrada" | "salida"
    cantidad: Number(data.cantidad),
    descripcion: data.descripcion || "",
    nota: data.nota || "",
    origen: "manual",
    referencia: data.referencia || "",
    estado: "activo",
    user_create_id: decoded?._id,
  };

  await crearElasticByType(movimiento, "movimiento_inventario");

  return { message: `Movimiento de ${data.tipo} registrado correctamente` };
};

/**
 * Registrar salida por factura de venta.
 * Se llama desde facturas.service cuando se crea una factura.
 */
export const registrarSalidaPorFacturaVenta = async (factura, token) => {
  const decoded = jwtDecode(token);
  const productos = factura.productos || [];

  for (const prod of productos) {
    const movimiento = {
      producto_id: prod.product_id,
      nombre_producto: prod.product_name || "",
      tipo: "salida",
      cantidad: Number(prod.cantidad),
      descripcion: `Venta - Factura FV-${factura.numero_factura}`,
      nota: "",
      origen: "factura_venta",
      referencia: factura._id || "",
      numero_factura: factura.numero_factura,
      estado: "activo",
      user_create_id: decoded?._id,
    };

    await crearElasticByType(movimiento, "movimiento_inventario");
  }
};

/**
 * Reversar salida cuando se anula una factura de venta.
 * Crea movimientos de entrada para compensar.
 */
export const reversarSalidaPorAnulacion = async (facturaId, token) => {
  const decoded = jwtDecode(token);
  const factura = await getDocumentById(facturaId);
  const productos = factura.productos || [];

  for (const prod of productos) {
    const movimiento = {
      producto_id: prod.product_id,
      nombre_producto: prod.product_name || "",
      tipo: "entrada",
      cantidad: Number(prod.cantidad),
      descripcion: `Anulacion Factura FV-${factura.numero_factura}`,
      nota: "",
      origen: "anulacion_factura_venta",
      referencia: facturaId,
      numero_factura: factura.numero_factura,
      estado: "activo",
      user_create_id: decoded?._id,
    };

    await crearElasticByType(movimiento, "movimiento_inventario");
  }
};

/**
 * Registrar entrada por factura de compra cuando cambia a "Pagada".
 */
export const registrarEntradaPorFacturaCompra = async (factura, token) => {
  const decoded = jwtDecode(token);
  const productos = factura.productos || [];

  for (const prod of productos) {
    const movimiento = {
      producto_id: prod.product_id,
      nombre_producto: prod.product_name || "",
      tipo: "entrada",
      cantidad: Number(prod.cantidad),
      descripcion: `Compra - Factura FC-${factura.numero_factura}`,
      nota: "",
      origen: "factura_compra",
      referencia: factura._id || "",
      numero_factura: factura.numero_factura,
      estado: "activo",
      user_create_id: decoded?._id,
    };

    await crearElasticByType(movimiento, "movimiento_inventario");
  }
};

/**
 * Reversar entrada cuando se anula una factura de compra.
 */
export const reversarEntradaPorAnulacionCompra = async (facturaId, token) => {
  const decoded = jwtDecode(token);
  const factura = await getDocumentById(facturaId);
  const productos = factura.productos || [];

  for (const prod of productos) {
    const movimiento = {
      producto_id: prod.product_id,
      nombre_producto: prod.product_name || "",
      tipo: "salida",
      cantidad: Number(prod.cantidad),
      descripcion: `Anulacion Factura Compra FC-${factura.numero_factura}`,
      nota: "",
      origen: "anulacion_factura_compra",
      referencia: facturaId,
      numero_factura: factura.numero_factura,
      estado: "activo",
      user_create_id: decoded?._id,
    };

    await crearElasticByType(movimiento, "movimiento_inventario");
  }
};

/**
 * Anular un movimiento manual
 */
export const anularMovimiento = async (movimientoId) => {
  await updateElasticByType(movimientoId, { estado: "anulado" });
  await client.indices.refresh({ index: INDEX_ES_MAIN });
  return { message: "Movimiento anulado" };
};

/**
 * Resumen de inventario paginado.
 * Primero obtiene los productos paginados, luego en una sola query
 * agrega entradas/salidas agrupadas por producto_id.
 */
export const getResumenInventario = async ({
  perPage = 15,
  page = 1,
  search = "",
} = {}) => {
  // 1. Obtener productos paginados
  const consultaProductos = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [{ term: { "type.keyword": "producto" } }],
        },
      },
      sort: [{ "name.keyword": { order: "asc" } }],
    },
  };

  if (search) {
    consultaProductos.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["name"],
      },
    });
  }

  const productosResult = await client.search(consultaProductos);
  const productos = productosResult.body.hits.hits;
  const totalProductos = productosResult.body.hits.total.value;

  if (productos.length === 0) {
    return { data: [], total: totalProductos, total_pages: 0 };
  }

  // 2. Obtener ids de esta pagina
  const prodIds = productos.map((p) => p._id);

  // 3. Una sola query de agregacion para todos los productos de la pagina
  const aggsResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "movimiento_inventario" } },
            { terms: { "producto_id.keyword": prodIds } },
            { term: { "estado.keyword": "activo" } },
          ],
        },
      },
      aggs: {
        por_producto: {
          terms: { field: "producto_id.keyword", size: perPage },
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

  // 4. Mapear agregaciones a un lookup rapido
  const stockMap = {};
  for (const bucket of aggsResult.body.aggregations.por_producto.buckets) {
    stockMap[bucket.key] = {
      entradas: bucket.entradas.suma.value || 0,
      salidas: bucket.salidas.suma.value || 0,
    };
  }

  // 5. Construir respuesta
  const data = productos.map((p) => {
    const stock = stockMap[p._id] || { entradas: 0, salidas: 0 };
    return {
      _id: p._id,
      nombre: p._source.name,
      stock_actual: stock.entradas - stock.salidas,
      total_entradas: stock.entradas,
      total_salidas: stock.salidas,
    };
  });

  return {
    data,
    total: totalProductos,
    total_pages: Math.ceil(totalProductos / perPage),
  };
};
