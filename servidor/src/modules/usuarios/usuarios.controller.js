import { jwtDecode } from "jwt-decode";
import * as service from "./usuarios.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const userId = jwtDecode(req.headers["access-token"])?._id;
    await service.create(req.body, userId);
    res.status(201).json({ message: "Usuario Creado." });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const update = async (req, res) => {
  try {
    await service.update(req.params.id, req.body);
    res.json({ message: "Usuario Actualizado" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    await service.changePassword(req.params.id, req.body.password);
    res.json({ message: "Actualizado" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
