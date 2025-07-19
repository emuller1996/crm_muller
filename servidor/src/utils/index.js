import { INDEX_ES_MAIN, INDEX_ES_MAIN_LOGS } from "../config.js";
import { client } from "../db.js";

export const parseDateISO = (sty) => {
  const dateString = sty;
  const completeDateString = dateString + ":00.000Z"; // Completando la cadena de tiempo
  const isoDate = new Date(completeDateString);

  console.log(isoDate.toISOString());

  return isoDate.toISOString();
};

export function getDatesByDays(startDate, endDate, days) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + days);
  }

  return dates;
}

export function getDatesEverySevenDays(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates;
}

export async function buscarElasticByType(type) {
  const searchResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1000,
    body: {
      query: {
        term: {
          type: type, // Consulta keyword para el atributo type igual a "clientes"
        },
      },
      sort: [
        { createdTime: { order: "desc" } }, // Reemplaza con el campo por el que quieres ordenar
      ],
    },
  });
  return searchResult.body.hits.hits.map((c) => {
    return {
      ...c._source,
      _id: c._id,
    };
  });
}

export async function buscarElasticByTypePagination(
  type,
  perPage,
  page,
  search,
  createdTime = "createdTime"
) {
  var consulta = {
    index: INDEX_ES_MAIN,
    size: perPage,
    from: (page - 1) * perPage,
    body: {
      query: {
        bool: {
          must: [
            { match: { type: type } },
            /* { match_phrase_prefix: { name: nameQuery } } */
          ],
        },
      },
      sort: [
        { [createdTime]: { order: "desc" } }, // Reemplaza con el campo por el que quieres ordenar
      ],
    },
  };
  if (search !== "" && search) {
    consulta.body.query.bool.must.push({
      match_phrase_prefix: { name: search },
    });
  }
  const searchResult = await client.search(consulta);

  const data = searchResult.body.hits.hits.map((c) => {
    return {
      ...c._source,
      _id: c._id,
    };
  });

  console.log(searchResult.body);
  return {
    data: data,
    total: searchResult.body.hits.total.value,
    total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
  };
}

export async function crearElasticByType(data, type) {
  var createType = data;
  createType.type = type;
  createType.createdTime = new Date().getTime();
  createType.updatedTime = new Date().getTime();
  const response = await client.index({
    index: INDEX_ES_MAIN,
    body: createType, // Contenido del documento
  });
  await client.indices.refresh({ index: INDEX_ES_MAIN });
  return response;
}

export async function crearLogsElastic(header, body, description) {
  var createType = {};
  createType.header = header;
  createType.body = body;
  createType.description = description;
  createType.type = "log";
  createType.createdTime = new Date().getTime();
  const response = await client.index({
    index: INDEX_ES_MAIN_LOGS,
    body: createType, // Contenido del documento
  });
  await client.indices.refresh({ index: INDEX_ES_MAIN_LOGS });
  return response;
}

export async function updateElasticByType(id, data) {
  data.updatedTime = new Date().getTime();
  const r = await client.update({
    index: INDEX_ES_MAIN,
    id: id,
    body: {
      doc: data,
    },
  });
  await client.indices.refresh({ index: INDEX_ES_MAIN });
  return r;
}

export async function getDocumentById(id) {
  const response = await client.get({
    index: INDEX_ES_MAIN, // Nombre del índice
    id: id, // ID del documento
  });
  return { ...response.body._source, _id: response.body._id };
}

export async function createInMasaDocumentByType(data, type) {
  data = data.map((c) => {
    return {
      ...c,
      type: type,
      createdTime: new Date().getTime(),
      updatedTime: new Date().getTime(),
    };
  });
  const operations = data.flatMap((doc) => [
    { index: { _index: INDEX_ES_MAIN } },
    doc,
  ]);

  const { body: bulkResponse } = await client.bulk({
    refresh: true,
    body: operations,
  });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: operations[i * 2],
          document: operations[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  /*  const response = await client.bulk({index:INDEX_ES_MAIN, body:{}}) */
  return bulkResponse;
}

export async function updateQuantityById(id, decrement) {
  try {
    // Obtener el documento actual
    const { body: document } = await client.get({
      index: INDEX_ES_MAIN,
      id: id,
    });

    // Calcular el nuevo valor de la cantidad
    const newQuantity = document._source.quantity - decrement;
    console.log(newQuantity);

    console.log(document._source.quantity);

    // Actualizar el documento
    const result = await client.update({
      index: INDEX_ES_MAIN,
      id: id,
      body: {
        doc: {
          quantity: newQuantity,
        },
      },
    });
    console.log("Documento actualizado:", result);
    return result;
  } catch (error) {
    console.error("Error actualizando el documento:", error);
  }
  await client.indices.refresh({ index: INDEX_ES_MAIN });
}
