import * as service from "./clientes.services.js";
import { jwtDecode } from "jwt-decode";

export const getAll = async (req, res) => {
  try {
    const clientes = await service.getAll();
    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const pagination = async (req, res) => {
  try {
    const result = await service.pagination(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const cliente = await service.getById(req.params.id);
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;
    data.user_create_id = jwtDecode(req.headers["access-token"])?._id;
    data.createdTime = Date.now();

    const customer = await service.create(data);

    return res.status(200).json({
      message: "Cliente Creado.",
      customer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    await service.update(req.params.id, req.body);
    return res.json({ message: "Cliente Actualizado" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const r = await service.createComment(req.body);
    return res.status(200).json({
      message: "Se creó el comentario correctamente.",
      r,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await service.getComments(req.params.id);
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const importExcel = async (req, res) => {
  try {
    await service.importExcel(req.files);
    return res.status(200).json({ message: "Importación realizada" });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};