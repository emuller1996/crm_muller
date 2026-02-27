import {
  buscarElasticByType,
  crearElasticByType,
  updateElasticByType,
} from "../../utils/index.js";

import { client } from "../../db.js";
import { INDEX_ES_MAIN } from "../../config.js";
import { jwtDecode } from "jwt-decode";

import { buildCotizacion } from "./cotizaciones.helpers.js";

export const getAll = async () => {
  let data = await buscarElasticByType("cotizacion");

  data = await Promise.all(
    data.map((c) => buildCotizacion(c))
  );

  return data;
};

export const create = async (data, token) => {
  data.status = "Pendiente";

  const decoded = jwtDecode(token);
  data.user_create_id = decoded?._id;

  const response = await crearElasticByType(
    data,
    "cotizacion"
  );

  return {
    message: "Cotización creada",
    recinto: response.body,
  };
};

export const update = async (id, body) => {
  const r = await updateElasticByType(id, body);

  if (r.body.result === "updated") {
    await client.indices.refresh({
      index: INDEX_ES_MAIN,
    });

    return { message: "Cotización actualizada" };
  }

  throw new Error("No se pudo actualizar");
};