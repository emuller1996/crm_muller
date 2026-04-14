import * as service from "./pedidos.service.js";
import { jwtDecode } from "jwt-decode";

export const getAll = async (req, res) => {
  try {
    res.json(await service.getAll(req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    res.json(await service.getById(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;
    data.user_create_id = jwtDecode(req.headers["access-token"])?._id;
    data.empresa_id = req.empresaId;

    const result = await service.create(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
