import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { client } from "../../../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../../../utils/index.js";
import { INDEX_ES_MAIN } from "../../../config.js";
import md5 from "md5";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGOS_DIR = path.resolve(__dirname, "../../../../uploads/logos");

export const getAll = async () => {
  return buscarElasticByType("empresa");
};

export const getById = async (id) => {
  return getDocumentById(id);
};

export const create = async (data) => {
  // Extraer datos del super usuario antes de crear la empresa
  const superUser = data.super_usuario;
  delete data.super_usuario;

  data.estado = data.estado ?? "activa";
  const response = await crearElasticByType(data, "empresa");
  const empresaId = response.body._id;

  // Crear super usuario vinculado a la empresa
  let usuarioCreado = null;
  if (superUser && superUser.email && superUser.password) {
    const userData = {
      name: superUser.name || "",
      email: superUser.email,
      password: md5(superUser.password),
      role_id: "super_user",
      empresa_id: empresaId,
    };
    const userResponse = await crearElasticByType(userData, "usuario");
    usuarioCreado = userResponse.body._id;

    // Guardar referencia del super usuario en la empresa
    await updateElasticByType(empresaId, { super_usuario_id: usuarioCreado });
    await client.indices.refresh({ index: INDEX_ES_MAIN });
  }

  return {
    message: "Empresa creada",
    empresa: response.body,
    super_usuario_id: usuarioCreado,
  };
};

export const update = async (id, data) => {
  const r = await updateElasticByType(id, data);
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Empresa actualizada" };
  }
};

export const disable = async (id) => {
  const r = await updateElasticByType(id, { estado: "inactiva" });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Empresa deshabilitada" };
  }
};

export const enable = async (id) => {
  const r = await updateElasticByType(id, { estado: "activa" });
  if (r.body.result === "updated") {
    await client.indices.refresh({ index: INDEX_ES_MAIN });
    return { message: "Empresa habilitada" };
  }
};

export const uploadLogo = async (id, file) => {
  if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR, { recursive: true });
  }

  const outputPath = path.join(LOGOS_DIR, `${id}.webp`);

  // Si ya existe un logo, se sobreescribe automaticamente
  await sharp(file.tempFilePath || file.data)
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  // Guardar referencia en el documento
  const logoUrl = `/uploads/logos/${id}.webp`;
  await updateElasticByType(id, { logo: logoUrl });
  await client.indices.refresh({ index: INDEX_ES_MAIN });

  return { message: "Logo actualizado", logo: logoUrl };
};

export const deleteLogo = async (id) => {
  const filePath = path.join(LOGOS_DIR, `${id}.webp`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await updateElasticByType(id, { logo: null });
  await client.indices.refresh({ index: INDEX_ES_MAIN });
  return { message: "Logo eliminado" };
};
