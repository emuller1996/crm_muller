import xlsx from "xlsx";
import { client } from "../../db.js";
import {
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
          fields: ["name", "description"],
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

export const importExcel = async (files, empresaId) => {
  const file = files?.file;
  const workbook = xlsx.readFile(file.tempFilePath);
  let data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  data = data.map((d) => ({ ...d, published: false, empresa_id: empresaId }));
  return createInMasaDocumentByType(data, "producto");
};
