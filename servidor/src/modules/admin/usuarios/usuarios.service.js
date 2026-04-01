import md5 from "md5";
import { client } from "../../../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../../utils/index.js";
import { INDEX_ES_MAIN } from "../../../config.js";

export const getAll = async () => {
  const usuarios = await buscarElasticByType("usuario_admin");

  return Promise.all(
    usuarios.map(async (u) => {
      const { password, ...rest } = u;
      if (rest.empresa_id) {
        try {
          const empresa = await getDocumentById(rest.empresa_id);
          rest.empresa = { _id: empresa._id, razon_social: empresa.razon_social };
        } catch {
          rest.empresa = null;
        }
      }
      return rest;
    })
  );
};

export const getById = async (id) => {
  const user = await getDocumentById(id);
  const { password, ...rest } = user;
  return rest;
};

export const create = async (data) => {
  data.password = md5(data.password);
  data.estado = data.estado ?? "activo";
  const response = await crearElasticByType(data, "usuario_admin");
  return { message: "Usuario creado", usuario: response.body };
};

export const update = async (id, data) => {
  // No permitir actualizar password desde aqui
  delete data.password;
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Usuario actualizado" };
  }
};

export const changePassword = async (id, password) => {
  const r = await updateElasticByType(id, { password: md5(password) });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Contrasena actualizada" };
  }
};

export const disable = async (id) => {
  const r = await updateElasticByType(id, { estado: "inactivo" });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Usuario deshabilitado" };
  }
};

export const enable = async (id) => {
  const r = await updateElasticByType(id, { estado: "activo" });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Usuario habilitado" };
  }
};
