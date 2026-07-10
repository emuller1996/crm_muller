import xlsx from "xlsx";
import { jwtDecode } from "jwt-decode";
import { client } from "../../db.js";
import {
  buscarElasticByTypeAndBusiness,
  crearElasticByType,
  createInMasaDocumentByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

export const getAll = async (empresaId) => {
  const searchResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "producto" } },
            { term: { "empresa_id.keyword": empresaId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });
  let data = searchResult.body.hits.hits.map((c) => ({ ...c._source, _id: c._id }));
  return Promise.all(
    data.map(async (p) => ({
      ...p,
      categoria: p.category_id ? await getDocumentById(p.category_id) : "",
    })),
  );
};

export const pagination = async (req) => {
  // (misma lógica que ya tienes, solo movida)
  console.log(req.query);

  let perPage = req?.query?.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";
  let gender = req.query.gender ?? "";
  let category = req.query.category ?? "";
  let empresaId = req.empresaId;

  if(!empresaId){
    throw Error("ERROR NO HAY EMPRESA")
  }
  console.log(empresaId);

  try {
    var consulta = {
      index: INDEX_ES_MAIN,
      size: perPage,
      from: (page - 1) * perPage,
      body: {
        query: {
          bool: {
            must: [
              /* { match_phrase_prefix: { name: nameQuery } } */
            ],
            filter: [
              {
                term: {
                  type: "producto",
                },
              },
              {
                term: {
                  "empresa_id.keyword": empresaId,
                },
              },
            ],
          },
        },
        sort: [
          { "name.keyword": { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    };
    if (gender !== "" && gender) {
      consulta.body.query.bool.filter.push({
        term: {
          "gender.keyword": gender,
        },
      });
    }
    if (category !== "" && category) {
      consulta.body.query.bool.filter.push({
        term: {
          "category_id.keyword": category,
        },
      });
    }

    if (search !== "" && search) {
      consulta.body.query.bool.must.push({
        query_string: {
          query: `*${search}*`,
          fields: ["name", "description","code"],
        },
      });
    }
    const searchResult = await client.search(consulta);

    var data = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });

    data = data.map(async (product) => {
      return {
        ...product,
        categoria: product.category_id
          ? await getDocumentById(product?.category_id)
          : "",
      };
    });
    data = await Promise.all(data);

    return {
      data: data,
      total: searchResult.body.hits.total.value,
      total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
    };
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPublished = async (query) => {
  // (misma lógica published)
};

export const getById = async (id) => {
  return getDocumentById(id);
};

export const create = async (data) => {
  await crearElasticByType(data, "producto");
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }
};

export const importExcel = async (files, empresaId, token) => {
  const file = files?.file;
  if (!file) throw new Error("No se ha seleccionado ningún archivo");

  const workbook = xlsx.readFile(file.tempFilePath);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  if (data.length === 0) throw new Error("El archivo no contiene datos");

  // Precargar categorías de la empresa: mapa nombreNormalizado -> category_id
  const categorias = await buscarElasticByTypeAndBusiness("categoria", empresaId);
  const categoriaMap = new Map();
  categorias.forEach((c) => {
    if (c?.name) categoriaMap.set(String(c.name).trim().toLowerCase(), c._id);
  });

  // Usuario que registra los movimientos (opcional)
  let userCreateId = null;
  try {
    if (token) userCreateId = jwtDecode(token)?._id ?? null;
  } catch (e) {
    userCreateId = null;
  }

  const errores = [];
  let insertados = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const { category, stock, ...resto } = row;

      // Resolver / crear categoría por nombre
      let categoryId = undefined;
      const categoriaNombre = category != null ? String(category).trim() : "";
      if (categoriaNombre !== "") {
        const key = categoriaNombre.toLowerCase();
        categoryId = categoriaMap.get(key);
        if (!categoryId) {
          const respCat = await crearElasticByType(
            { name: categoriaNombre, empresa_id: empresaId },
            "categoria",
          );
          categoryId = respCat.body._id;
          categoriaMap.set(key, categoryId);
        }
      }

      // Crear producto (stock no se guarda en el producto)
      const producto = {
        ...resto,
        published: false,
        empresa_id: empresaId,
      };
      if (categoryId) producto.category_id = categoryId;

      const respProd = await crearElasticByType(producto, "producto");
      const productoId = respProd.body._id;

      // Generar movimiento de inventario por las existencias iniciales
      const cantidad = Number(stock);
      if (!Number.isNaN(cantidad) && cantidad > 0) {
        await crearElasticByType(
          {
            producto_id: productoId,
            nombre_producto: producto.name ?? "",
            tipo: "entrada",
            cantidad,
            descripcion: "Importación inicial",
            nota: "",
            origen: "importacion",
            referencia: "",
            estado: "activo",
            empresa_id: empresaId,
            user_create_id: userCreateId,
          },
          "movimiento_inventario",
        );
      }

      insertados++;
    } catch (error) {
      errores.push({ fila: i + 2, error: error.message || "Error desconocido" });
    }
  }

  return {
    total_filas: data.length,
    insertados,
    errores_count: errores.length,
    errores: errores.slice(0, 10),
  };
};
