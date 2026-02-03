import xlsx from "xlsx";
import { client } from "../../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  createInMasaDocumentByType,
  getDocumentById,
  updateElasticByType,
} from "../../utils/index.js";
import { INDEX_ES_MAIN } from "../../config.js";

export const getAll = async () => {
  const clientes = await buscarElasticByType("cliente");
  return Promise.all(clientes);
};

export const pagination = async ({ perPage = 10, page = 1, search = "" }) => {
  const consulta = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [],
          filter: [{ term: { type: "cliente" } }],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  };

  if (search) {
    consulta.body.query.bool.must.push({
      query_string: {
        query: `*${search}*`,
        fields: ["name", "telefono", "alias"],
      },
    });
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
  };
};

export const getById = (id) => {
  return getDocumentById(id);
};

export const create = async (data) => {
  const response = await crearElasticByType(data, "cliente");
  return response.body;
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }
};

export const createComment = (data) => {
  return crearElasticByType(data, "comentario");
};

export const getComments = async (clienteId) => {
  const searchResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "comentario" } },
            { term: { "clien_id.keyword": clienteId } },
          ],
        },
      },
      sort: [{ createdTime: { order: "desc" } }],
    },
  });

  return searchResult.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));
};

export const importExcel = async (files) => {
  const file = files?.file;
  if (!file) throw new Error("No se ha seleccionado ningún archivo");

  const workbook = xlsx.readFile(file.tempFilePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);

  await createInMasaDocumentByType(data, "cliente");
};
