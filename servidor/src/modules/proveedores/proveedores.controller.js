import * as service from "./proveedores.service.js";
import { jwtDecode } from "jwt-decode";

export const getAll = async (req, res) => {
  try {
    const proveedores = await service.getAll(req.empresaId);
    return res.status(200).json(proveedores);
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
    const proveedor = await service.getById(req.params.id);
    return res.status(200).json(proveedor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;
    data.user_create_id = jwtDecode(req.headers["access-token"])?._id;
    data.empresa_id = req.empresaId;
    data.createdTime = Date.now();

    const proveedor = await service.create(data);

    return res.status(200).json({
      message: "Proveedor Creado.",
      proveedor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    await service.update(req.params.id, req.body);
    return res.json({ message: "Proveedor Actualizado" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
