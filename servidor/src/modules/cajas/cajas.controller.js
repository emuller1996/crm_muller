import * as service from "./cajas.service.js";
import { jwtDecode } from "jwt-decode";

const normalizeData = (data) => {
  if (data.monto_maximo !== undefined && data.monto_maximo !== null && data.monto_maximo !== "") {
    data.monto_maximo = parseFloat(data.monto_maximo);
  }
  if (Array.isArray(data.usuarios)) {
    data.usuarios = JSON.stringify(data.usuarios);
  }
  return data;
};

export const getAll = async (req, res) => {
  try {
    const cajas = await service.getAll(req.empresaId);
    return res.status(200).json(cajas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const pagination = async (req, res) => {
  try {
    const result = await service.pagination({ ...req.query, empresa_id: req.empresaId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const caja = await service.getById(req.params.id);
    return res.status(200).json(caja);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = normalizeData(req.body);
    data.user_create_id = jwtDecode(req.headers["access-token"])?._id;
    data.empresa_id = req.empresaId;

    const caja = await service.create(data);

    return res.status(200).json({
      message: "Caja Creada.",
      caja,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    await service.update(req.params.id, normalizeData(req.body));
    return res.json({ message: "Caja Actualizada" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
