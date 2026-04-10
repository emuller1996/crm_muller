import { jwtDecode } from "jwt-decode";
import * as service from "./actividades.service.js";

export const getAll = async (req, res) => {
  try {
    res.json(await service.getAll(req.empresaId));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getById = async (req, res) => {
  try {
    res.json(await service.getById(req.params.id));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const userId = jwtDecode(req.headers["access-token"])?._id;
    req.body.empresa_id = req.empresaId;
    await service.create(req.body, userId);
    res.status(201).json({ message: "Actividad creada" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const update = async (req, res) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.json({ message: "Actividad eliminada" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
